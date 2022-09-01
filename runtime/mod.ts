import { Series } from "../analysis/mod.ts";
import { Symbol, Kline, Interval } from "../generic.ts";

let RUNTIME: Runtime;

export let time: Array<number>;
export let open: Array<number>;
export let high: Array<number>;
export let low: Array<number>;
export let close: Array<number>;
export let volume: Array<number>;

export interface RuntimeOptions {
  /** Interval of the runtime */
  interval?: Interval;

  /** History length */
  history?: Record<Interval, {
    /** Kline history length */
    history?: number;

    /** Required history length */
    required?: number;
  }>;
}

export class Runtime {
  #options: RuntimeOptions;
  #series: Record<string, Array<number>[]> = {};

  symbol: Symbol = undefined as unknown as Symbol;
  interval: Interval = undefined as unknown as Interval;

  constructor(options: RuntimeOptions) {
    this.#options = {
      ...options,
    }
  }

  open(symbol: Symbol, kline: Kline, interval: Interval) {
    const key = symbol.toString() + interval

    // Ensure the series is initialized.
    this.#series[key] = this.#series[key] || [[], [], [], [], [], []];

    // Updating instance variables.
    RUNTIME = this;
    this.symbol = symbol;
    this.interval = interval;

    // Link global variables to the this object.
    time = this.#series[key][0];
    open = this.#series[key][1];
    high = this.#series[key][2];
    low = this.#series[key][3];
    close = this.#series[key][4];
    volume = this.#series[key][5];

    // Add the new data to the series.
    time.unshift(kline[0]);
    open.unshift(kline[1]);
    high.unshift(kline[2]);
    low.unshift(kline[3]);
    close.unshift(kline[4]);
    volume.unshift(kline[5]);

    // Remove the oldest data from the series.
    const length = this.#options.history?.[interval].history ?? 100;
    if (time.length > length)
      time.pop();
    if (open.length > length)
      open.pop();
    if (high.length > length)
      high.pop();
    if (low.length > length)
      low.pop();
    if (close.length > length)
      close.pop();
    if (volume.length > length)
      volume.pop();
  }

  close() {
    // Unlink global variables from the this object.
    time = undefined as unknown as Array<number>;
    open = undefined as unknown as Array<number>;
    high = undefined as unknown as Array<number>;
    low = undefined as unknown as Array<number>;
    close = undefined as unknown as Array<number>;
    volume = undefined as unknown as Array<number>;
  }

  series(symbol: Symbol, interval: Interval): Series<number>[] {
    const key = symbol.toString() + interval
    const series = this.#series[key];
    if (!series) return [[], [], [], [], [], []];
    return series;
  }

  isReady(symbol: Symbol, interval: Interval) {
    if (this.#options.interval)
      if (this.#options.interval !== interval) return false;
    for (const interval in this.#options.history) {
      const key = symbol.toString() + interval
      if (!this.#series[key]) return false;
      const required = this.#options.history[interval as Interval].required ?? 0;
      if (this.#series[key]?.[0]?.length < required) return false;
    }
    return true;
  }
}

export function getSeries(interval: Interval): Series<number>[];
export function getSeries(symbol: Symbol, interval: Interval): Series<number>[];
export function getSeries(symbol: Symbol | Interval, interval?: Interval): Series<number>[] {
  if (interval)
    return RUNTIME.series(symbol as Symbol, interval);
  return RUNTIME.series(RUNTIME.symbol, symbol as Interval);
}

export function getSymbol(): Symbol {
  return RUNTIME.symbol;
}

export function getInterval(): Interval {
  return RUNTIME.interval;
}

export function getTimestamp(): number {
  return time[0];
}

export function getDay(): number {
  return new Date(time[0]).getUTCDay();
}

export function getMonth(): number {
  return new Date(time[0]).getUTCMonth() + 1;
}

export function getYear(): number {
  return new Date(time[0]).getUTCFullYear();
}