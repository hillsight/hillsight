import { resolve } from "https://deno.land/std@0.149.0/path/mod.ts";

/**
 * Representation of the account balance.
 * A object with symbols as keys and balance as value.
 */
export type Balance = {
  [key: string]: number;
}

/**
 * Required supported intervals for the provider.
 */
export type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w';

/**
 * Representation of a kline.
 * `[time, open, high, low, close, volume]`
 */
export type Kline = [number, number, number, number, number, number];

/**
 * Representation of a symbol pair.
 * @example ['BTC', 'USD'] or ['BTC', 'USDT']
 */
export type Symbol = [string, string];

export type Provider = {
  name: string;

  /**
   * Get the balance of an account.
   */
  balance(): Promise<Balance>;

  /**
   * Get a list of all available symbols.
   */
  symbols(): Promise<Symbol[]>;

  /**
   * Get the current time on the exchange. *(Used for time synchronization)*
   * @returns The current time on the exchange.
   * @throws An error if the time cannot be retrieved.
   */
  time(): Promise<number>;

  /**
   * Place a limit order on the exchange.
   * @param symbol The symbol to trade.
   * @param side The side of the order. (buy or sell)
   * @param price The price of the order.
   * @param quantity The quantity of the order.
   */
  order_limit(symbol: Symbol, side: 'buy' | 'sell', quantity: number, price: number): Promise<string>;

  /**
   * Place a market order on the exchange.
   * @param symbol The symbol to trade.
   * @param side The side of the order. (buy or sell)
   * @param quantity The quantity of the order. (optional)
   * @param quote The amount of quote currency to spend. (optional)
   */
  order_market(symbol: Symbol, side: 'buy' | 'sell', quantity?: number, quote?: number): Promise<string>;

  /**
   * Cancel an order on the exchange.
   * @param symbol The symbol to trade.
   * @param id The id of the order to cancel.
   */
  cancel(symbol: Symbol, id: string): Promise<boolean>;

  /**
   * Stream klines for multiple symbols and intervals.
   * @param symbols The symbols to stream.
   */
  stream(symbols: {
    symbol: Symbol;
    interval: Interval;
  }[]): AsyncGenerator<[Symbol, Kline], void, unknown>

  /**
   * Get historical data for a symbol and interval.
   * @param symbol The symbol to get historical data for.
   * @param interval The interval to get historical data for.
   * @param start The start time of the historical data.
   * @param end The end time of the historical data.
   */
  history(symbol: Symbol, interval: Interval, start: Date, end?: Date): Promise<Kline[]>;
}

/**
 * The credentials to use to authenticate with the exchange.
 */
export type Credentials = {
  api_key?: string;
  secret_key?: string;
}

/**
 * Create a new exchange provider.
 * @param provider The exchange provider service to use.
 * @returns A function that can be used to trigger the provider.
 * 
 * @example
 * ```ts
 * createProvider(({ api_key, secret_key, ...options }) => {
 *    // provider service...
 * })
 * ```
 * @example
 * Example of a static provider service, e.g. a simulator.
 * ```ts
 * createProvider({
 *    // static provider service...
 * })
 * ```
 */
export function createProvider(provider: Provider): () => Provider;
export function createProvider<T extends Record<string, unknown>>(provider: ((options: Credentials & T) => Provider)): (options: Credentials & T) => Provider;
export function createProvider<T extends Record<string, unknown>>(provider: Provider | ((options: Credentials & T) => Provider)): (options: Credentials & T) => Provider {
  if (typeof provider === 'function') {
    return (options) => provider(options);
  }
  return () => provider;
}

export const DEFAULT_CACHE_DIR = resolve(Deno.cwd(), '.cache');
export const ACCEPTABLE_INTERVALS = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w'];