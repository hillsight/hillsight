import { resolve } from "https://deno.land/std@0.149.0/path/mod.ts";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";
import {
  ensureDirSync,
  existsSync,
} from "https://deno.land/std@0.149.0/fs/mod.ts";

import { createProvider, DEFAULT_CACHE_DIR, ACCEPTABLE_INTERVALS } from "./provider.ts";
import type { Symbol, Credentials, Kline, Interval } from "./provider.ts";

import { connect } from "../utils/websocket.ts";
import { download } from "../utils/download.ts";

export type Options = {
  cache_dir?: string;
}

let timeOffset: number;

async function __unsafePrivateCall(path: string, credentials: Credentials, params: Record<string, unknown> = {}, options: RequestInit = {}) {
  const url = new URL(path, "https://api.binance.com");

  // Collect the server timestamp.
  if (!timeOffset) {
    const { serverTime } = await __unsafePublicCall(
      "/api/v3/time",
    ).then(response => response.json());
    timeOffset = serverTime - Date.now();
  }
  const timestamp = String(Date.now() + timeOffset);

  // Create the query string.
  const query = new URLSearchParams({
    ...params,
    timestamp,
  });

  // Generate the signature.
  const signature = hmac(
    "sha256",
    credentials!.secret_key as string,
    query.toString(),
    "utf8",
    "hex"
  );

  query.set("signature", signature.toString());

  url.search = query.toString();

  return await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      "X-MBX-APIKEY": credentials!.api_key as string,
    },
  })
}

function __unsafePublicCall(path: string, params: Record<string, unknown> = {}, options: RequestInit = {}) {
  const url = new URL(path, "https://api.binance.com");
  const query = new URLSearchParams(params as Record<string, string>);
  url.search = query.toString();
  return fetch(url, options);
}

export default createProvider<Options>(({ api_key, secret_key, cache_dir = DEFAULT_CACHE_DIR }) => ({
  name: "Binance",

  async balance() {
    const balance = await __unsafePrivateCall("/api/v3/account", {
      api_key,
      secret_key,
    })
      .then(response => response.json())
      .then(response => response.balances
        .filter((balance: { free: number }) => balance.free > 0)
      );
    return balance;
  },

  async symbols() {
    const { symbols } = await __unsafePublicCall("/api/v3/exchangeInfo")
      .then(response => response.json());
    return symbols.map((symbol: { baseAsset: string; quoteAsset: string; }) => [symbol.baseAsset, symbol.quoteAsset]);
  },

  async time() {
    // Collect the server timestamp.
    if (!timeOffset) {
      const { serverTime } = await __unsafePublicCall(
        "/api/v3/time",
      ).then(response => response.json());
      timeOffset = serverTime - Date.now();
    }
    return Date.now() + timeOffset;
  },

  async order_limit(symbol: Symbol, side: "buy" | "sell", quantity: number, price: number) {
    const order = await __unsafePrivateCall("/api/v3/order", {
      api_key,
      secret_key,
    }, {
      symbol: symbol.join(""),
      side,
      type: "LIMIT",
      quantity,
      price,
    }, {
      method: "POST",
    })
      .then(response => response.json())
      .then(response => response.orderId as string);
    return order;
  },

  async order_market(symbol: Symbol, side: "buy" | "sell", quantity?: number, qoute?: number) {
    const order = await __unsafePrivateCall("/api/v3/order", {
      api_key,
      secret_key,
    }, {
      symbol: symbol.join(""),
      side,
      type: "MARKET",
      ...(qoute ? {
        qouteOrderQty: qoute,
      } : {
        quantity,
      }),
    }, {
      method: "POST",
    })
      .then(response => response.json())
      .then(response => response.orderId as string);
    return order;
  },

  async cancel(symbol: Symbol, id: string) {
    const { status } = await __unsafePrivateCall("/api/v3/order", {
      api_key,
      secret_key,
    }, {
      symbol: symbol.join(""),
      orderId: id,
    }, {
      method: "DELETE",
    })
      .then(response => response.json());
    return status === "CANCELED";
  },

  async *stream(symbols: {
    symbol: Symbol;
    interval: Interval;
  }[]): AsyncGenerator<[Symbol, Kline], void, unknown> {
    // Validate the intervals.
    symbols.forEach(({ symbol, interval }) => {
      if (!ACCEPTABLE_INTERVALS.includes(interval)) {
        throw new Error(`Invalid interval: ${interval} in ${symbol}. If you mean this is a problem with the library, please report it as an issue.`);
      }
    });

    const streams = symbols.map(({ symbol, interval }) => `${symbol.join("")}@kline_${interval}`);

    let retries = 0;
    while (retries++ < 3) {
      const socket = connect(`wss://stream.binance.com:9443/stream?streams=${streams.join("/").toLowerCase()}`);

      for await (const event of socket) {
        if (event.data === "PING") {
          socket.send("PONG");
          continue;
        }

        const { data } = JSON.parse(event.data);

        // Only emit finalised klines.
        if (data.k.x) {
          const symbol = symbols.find(({ symbol }) => symbol.join("") === data.s)!.symbol;
          const kline: Kline = [data.k.t, +data.k.o, +data.k.h, +data.k.l, +data.k.c, +data.k.v];

          yield [symbol, kline];
        }
      }
    }
  },

  async history(symbol: Symbol, interval: Interval, start: Date, end: Date = new Date()) {
    if (!ACCEPTABLE_INTERVALS.includes(interval)) {
      throw new Error(`Invalid interval: ${interval}. If you mean this is a problem with the library, please report it as an issue.`);
    }

    const klines: Kline[] = [];

    let __end = new Date(end);
    // Check if the date is the last day of the month.
    if (__end.getDate() !== new Date(__end.getFullYear(), __end.getMonth() + 1, 0).getDate()) {
      __end.setMonth(__end.getMonth() + 1);
    }

    // Limit history to the last month from the current date.
    const lastMonth = new Date();
    lastMonth.setDate(0);
    if (__end > lastMonth) {
      // Correct the __end date.
      __end = lastMonth;
    }
    if (end > lastMonth) {
      // Correct the end date.
      end = lastMonth;
    }

    // Loop months between start and end.
    for (const date = new Date(start); date <= __end; date.setMonth(date.getMonth() + 1)) {
      // Construct the filename <symbol>-<interval>-<year>-<month>
      const filename = `${symbol.join('')}-${interval}-${date.getFullYear()}-${(date.getMonth() + 1) < 10 ? "0" : ""
        }${date.getMonth() + 1}`;

      // Set the output path.
      const output = resolve(cache_dir, this.name.toLowerCase(), filename + ".csv");

      // Check if the file exists, if not, download it.
      if (!existsSync(output)) {
        // Construct the URL.
        const url = `https://data.binance.vision/data/spot/monthly/klines/${symbol.join("")}/${interval}/${filename}.zip`;

        // Ensure the output directory exists.
        ensureDirSync(cache_dir);

        // Download the file.
        try {
          await download(url, output, {
            // Binance stores the data in a zip file, so we need to decompress it.
            unzip: true
          });
        } catch {
          throw new Error(`Unable to find ${symbol.join("")} ${interval} data for ${date.toDateString()}.`);
        }
      }

      // Read the file.
      try {
        Deno.readTextFileSync(output).split("\n").slice(1).forEach((line: string) => {
          const [time, open, high, low, close, volume] = line.split(",").map(Number);
          klines.push([time, open, high, low, close, volume]);
        });
      } catch {
        throw new Error(`Unable to read ${symbol.join("")} ${interval} data for ${date.toDateString()}.`);
      }
    }

    return klines.filter(([time]) => {
      return time >= start.getTime() && time <= end.getTime()
    });
  },
}));