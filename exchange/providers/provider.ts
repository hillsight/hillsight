import { Interval, Kline, Symbol } from "../../generic.ts";

/**
 * Representation of the account balance.
 * A object with currencies as keys and balance as value.
 */
 export type Balance = {
  [key: string]: number;
}

export interface Order {
  /** The type of the order. (LIMIT or MARKET) */
  type: 'LIMIT' | 'MARKET';

  /** The side of the order. (buy or sell) */
  side: 'buy' | 'sell';

  /** 
   * The quantity of the order.
   */
  quantity: number;

  /** 
   * The price of the order. Ignored if the quantity is represented as quote currency.
   * @see quote
   */
  price?: number;

  /** 
   * If the order quantity is represented in a quote currency.
   * @default false
   */
  quote?: boolean;
}

export interface Position {
  /** The id of the position. */
  id: string;

  /** The symbol of the position. */
  symbol: Symbol;
  
  /** The side of the position. */
  side: 'buy' | 'sell';

  /** The quantity of the position. */
  quantity: number;

  /** The price of the position. */
  price: number;

  /** The time of the position. */
  time: number;

  /** The slippage of the position. (optional) */
  slippage?: number;
}

export abstract class Exchange {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Get the available balance of the account.
   * @example {'BTC': 0.1, 'ETH': 0.2}
   * @returns The balance of the account.
   */
  abstract balance(): Promise<Balance>;

  /**
   * Get the available symbol pairs on the exchange.
   * @example [['BTC', 'USDT'], ['ETH', 'USDT']]
   * @returns The available symbol pairs on the exchange.
   */
  abstract symbols(): Promise<Symbol[]>;

  /**
   * Get the current time on the exchange. *(Used for time synchronization)*
   * @returns The current time on the exchange.
   * @throws An error if the time cannot be retrieved.
   * @example 1589788800
   */
  abstract time(): Promise<number>;

  /**
   * Place a order on the exchange.
   * @param symbol The symbol to trade.
   * @param options The options of the order.
   * @throws An error if the order cannot be placed.
   */
  abstract order(symbol: Symbol, options: Order): Promise<Position>;

  /**
   * Cancel an order on the exchange.
   * @param symbol The symbol to trade.
   * @param id The id of the order to cancel.
   * @throws An error if the order cannot be canceled.
   */
  abstract cancel(symbol: Symbol, id: string | Position): Promise<boolean>;

  /**
   * Get the current price of a symbol or multiple symbols.
   * @param symbols The symbol or symbols to get the price of.
   * @returns The current price of the symbol.
   * @throws An error if the price cannot be retrieved.
   */
  abstract price(...symbols: Symbol[]): Promise<{
    [key: string]: number;
  }>;

  /**
   * Stream klines for multiple symbols and intervals.
   * @param symbols The symbols to stream.
   * @throws An error if the stream cannot be started.
   * @example [ [symbol('BTC', 'USD'), '1m'], [symbol('ETH', 'USD'), '1m'] ]
   * @example
   * ```ts
   * const pairlist = new Pairlist( exchange, filter );
   * const symbols = pairlist.at( exchange.time(), "1m" );
   * exchange.stream( symbols );
   * ```
   * @returns A stream of klines.
   */
  abstract stream(symbols: [Symbol, Interval][]): AsyncGenerator<[Symbol, Kline, Interval], void, unknown>

  /**
   * Stream historical klines for a symbol in a specific time range and interval.
   * @param symbols The symbols to stream.
   * @param timerange The time range to get the klines of.
   * @throws An error if the stream cannot be started.
   * @example [ [symbol('BTC', 'USD'), '1m'], [symbol('ETH', 'USD'), '1m'] ]
   */
  abstract history(symbols: [Symbol, Interval][], timerange: {
    from: Date,
    to?: Date
  }): AsyncGenerator<[Symbol, Kline, Interval], void, unknown>;
}