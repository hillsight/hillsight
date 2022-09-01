/**
 * Representation of a kline.
 * `[time, open, high, low, close, volume]`
 */
export type Kline = [number, number, number, number, number, number];

/**
 * Representation of a interval.
 */
export type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d';

/**
 * Representation of a symbol pair.
 * @example ['BTC', 'USD'] or ['BTC', 'USDT']
 */
export type Symbol = [string, string];

/**
 * Create a array representation of a symbol.
 * 
 * @param base The base currency of the symbol.
 * @param quote The quote currency of the symbol.
 * @returns The symbol of the pair.
 */
export function Symbol(base: string, quote: string): Symbol {
  const symbol: Symbol = [base.toUpperCase(), quote.toUpperCase()];
  symbol.toString = () => `${symbol[0]}${symbol[1]}`;
  return symbol;
}

/** Index of the <time> in a kline. */
export const TIME = 0;
/** Index of the <open> in a kline. */
export const OPEN = 1;
/** Index of the <high> in a kline. */
export const HIGH = 2;
/** Index of the <low> in a kline. */
export const LOW = 3;
/** Index of the <close> in a kline. */
export const CLOSE = 4;
/** Index of the <volume> in a kline. */
export const VOLUME = 5;