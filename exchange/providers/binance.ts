import { resolve } from "https://deno.land/std@0.149.0/path/mod.ts";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";
import {
  ensureDirSync,
} from "https://deno.land/std@0.149.0/fs/mod.ts";

import { ACCEPTABLE_INTERVALS, DEFAULT_CACHE_DIR } from "../mod.ts";
import { Exchange, Balance, Order, Position } from './provider.ts'
import { Interval, Kline, Symbol } from "../../generic.ts";
import { connect } from "../../utils/websocket.ts";
import { download } from "../../utils/download.ts";

export interface BinanceOptions {
  /** The directory to cache the data in. */
  cache_dir?: string;

  /** The API_KEY to use. */
  api_key: string;

  /** The SECRET_KEY to use. */
  secret_key: string;
}

/** Interval correction table */
const correction_table: {
  [key in Interval]: number;
} = {
  "1m": 1000 * 60,
  "5m": 1000 * 60 * 5,
  "15m": 1000 * 60 * 15,
  "30m": 1000 * 60 * 30,
  "1h": 1000 * 60 * 60,
  "2h": 1000 * 60 * 60 * 2,
  "4h": 1000 * 60 * 60 * 4,
  "6h": 1000 * 60 * 60 * 6,
  "8h": 1000 * 60 * 60 * 8,
  "12h": 1000 * 60 * 60 * 12,
  "1d": 1000 * 60 * 60 * 24,
}

export class Binance extends Exchange {
  #options: BinanceOptions;
  #time_offset: number;

  constructor(options: BinanceOptions) {
    super('binance');

    this.#options = {
      cache_dir: DEFAULT_CACHE_DIR,
      ...options,
    };
    this.#time_offset = undefined as unknown as number;
  }

  balance(): Promise<Balance> {
    return this.#fetch("/api/v3/account", {}, {}, true)
      .then(response => response.json())
      .then(response => response.balances
        .filter((balance: { free: number }) => balance.free > 0)
      );
  }

  symbols(): Promise<Symbol[]> {
    return this.#fetch("/api/v3/exchangeInfo")
      .then(response => response.json())
      .then(response => response.symbols)
      .then(symbols => symbols.map(
        (symbol: { baseAsset: string; quoteAsset: string; }) =>
          [symbol.baseAsset, symbol.quoteAsset]
      ))
  }

  time(): Promise<number> {
    if (this.#time_offset)
      return Promise.resolve(Date.now() + this.#time_offset);
    return this.#fetch("/api/v3/time")
      .then(response => response.json())
      .then(response => {
        this.#time_offset = response.serverTime - Date.now();
        return Date.now() + this.#time_offset;
      });
  }

  order(symbol: Symbol, options: Order): Promise<Position> {
    return this.#fetch("/api/v3/order", {
      symbol: symbol.join(""),
      side: options.side,
      type: options.type,
      ...(options.quote ? {
        quoteOrderQty: options.quantity,
      } : {
        quantity: options.quantity,
        price: options.price,
      })
    }, { method: "POST" })
      .then(response => response.json())
      .then(response => ({
        id: response.orderId,
        symbol: symbol,
        side: options.side,
        price: +response.price,
        quantity: +response.origQty,
        time: response.transactTime,
      } as Position));
  }

  cancel(symbol: Symbol, id: string | Position): Promise<boolean> {
    return this.#fetch("/api/v3/order", {
      symbol: symbol.join(""),
      orderId: typeof id === "string" ? id : id.id,
    }, { method: "DELETE" })
      .then(response => response.ok);
  }

  price(...symbols: Symbol[]): Promise<{ [key: string]: number; }> {
    return this.#fetch("/api/v3/ticker/price", {
      symbols: `[\"${symbols.map(symbol => symbol.join("")).join("\",\"")}\"]`
    })
      .then(response => response.json())
      .then(response => response.reduce((acc: { [key: string]: number; }, { symbol, price }: {
        symbol: string;
        price: string;
      }) => ({ ...acc, [symbol]: +price }), {}));
  }

  async *stream(symbols: [Symbol, Interval][]): AsyncGenerator<[Symbol, Kline, Interval], void, unknown> {
    // Validate the intervals.
    symbols.forEach(([symbol, interval]) => {
      if (!ACCEPTABLE_INTERVALS.includes(interval)) {
        throw new Error(`Invalid interval: ${interval} in ${symbol}. If you mean this is a problem with the library, please report it as an issue.`);
      }
    });

    const streams = symbols.map(([symbol, interval]) => `${symbol.join("")}@kline_${interval}`);

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
          const symbol = symbols.find(([symbol]) => symbol.join("") === data.s);
          const kline: Kline = [data.k.t, +data.k.o, +data.k.h, +data.k.l, +data.k.c, +data.k.v];

          yield [symbol![0], kline, data.k.i];
        }
      }
    }
  }

  async *history(symbols: [Symbol, Interval][], { from, to = new Date() }: { from: Date; to?: Date; }): AsyncGenerator<[Symbol, Kline, Interval], void, unknown> {
    // Validate the intervals.
    symbols.forEach(([symbol, interval]) => {
      if (!ACCEPTABLE_INTERVALS.includes(interval)) {
        throw new Error(`Invalid interval: ${interval} in ${symbol}. If you mean this is a problem with the library, please report it as an issue.`);
      }
    });

    // Compute the last month from the current date.
    const last_month = new Date();
    last_month.setDate(0);
    if (to > last_month) {
      to = last_month;
    }

    const cache_dir = this.#options.cache_dir || DEFAULT_CACHE_DIR;
    const start_time = from.getTime(); // Used to filter the klines.
    const end_time = to.getTime(); // Used to filter the klines.

    // Ensure the output directory exists.
    ensureDirSync(cache_dir);

    const filename = (symbol: Symbol, interval: Interval, year: number, month: number) => {
      return `${symbol.join("")}-${interval}-${year}-${month + 1 < 10 ? "0" : ""}${month + 1}`;
    }

    const url = (symbol: Symbol, interval: Interval, year: number, month: number) => {
      return `https://data.binance.vision/data/spot/monthly/klines/${symbol.join("")}/${interval}/${filename(symbol, interval, year, month)}.zip`;
    }

    const output = (symbol: Symbol, interval: Interval, year: number, month: number) => {
      return resolve(cache_dir, this.name.toLowerCase(), filename(symbol, interval, year, month) + ".csv");
    }

    // Loop trough the months.
    for (const date = new Date(from); date <= to; date.setMonth(date.getMonth() + 1)) {
      const year = date.getFullYear();
      const month = date.getMonth();

      const timeline: {
        [key: number]: [Symbol, Kline, Interval][]
      } = {};

      // Loop trough the symbols.
      for (const [symbol, interval] of symbols) {
        let dataset: Kline[] = [];
        try {
          // Try to read the file.
          dataset = Deno.readTextFileSync(output(symbol, interval, year, month))
            .split("\n")
            .map((line: string) => line.split(",", 6).map(v => +v) as Kline) // This takes ALOT of the performance?
        } catch {
          // If the file does not exist, download it.
          try {
            await download(url(symbol, interval, year, month), output(symbol, interval, year, month), {
              // Binance stores the data in a zip file, so we need to decompress it.
              unzip: true
            });
          } catch {
            throw new Error(`Unable to find ${symbol.join("")} ${interval} data at ${url(symbol, interval, year, month)}`);
          }

          // Read the file.
          dataset = Deno.readTextFileSync(output(symbol, interval, year, month))
            .split("\n").slice(1)
            .map((line: string) => line.split(",", 6).map(Number) as Kline)
        }

        for (const kline of dataset) {
          if (kline[0] < start_time || kline[0] > end_time)
            continue;

          const timestamp = kline[0] + correction_table[interval];
          timeline[timestamp] = timeline[timestamp] || [];
          timeline[timestamp].push([symbol, kline, interval]);
        }
      }

      // Loop trough the timeline (sorted by time).
      for (const timestamp of Object.keys(timeline).map(Number).sort((a, b) => a - b)) {
        const datasets = timeline[timestamp];
        for (const [symbol, kline, interval] of datasets) {
          yield [symbol, kline, interval];
        }
      }
    }
  }

  async #fetch(path: string, params: Record<string, unknown> = {}, options: RequestInit = {}, sign = false) {
    const url = new URL(path, "https://api.binance.com");

    const query = new URLSearchParams(params as Record<string, string>);

    if (sign) {
      // Collect the server timestamp.
      if (!this.#time_offset) {
        const { serverTime } = await this.#fetch(
          "/api/v3/time",
        ).then(response => response.json());
        this.#time_offset = serverTime - Date.now();
      }
      const timestamp = String(Date.now() + this.#time_offset);

      // Apply the timestamp to the query string.
      query.set("timestamp", timestamp);

      // Generate the signature.
      const signature = hmac(
        "sha256",
        this.#options.secret_key as string,
        query.toString(),
        "utf8",
        "hex"
      );

      query.set("signature", signature.toString());
    }

    url.search = query.toString();

    return await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        ...(sign ? { "X-MBX-APIKEY": this.#options.api_key as string } : {}),
      },
    })
  }
}