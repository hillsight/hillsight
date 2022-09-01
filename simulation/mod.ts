import { Balance, Exchange, Order, Position } from "../exchange/providers/provider.ts";
import { Interval, Kline, Symbol } from "../generic.ts";

/**
 * Representation of the status of a simulation.
 */
export type Status = 'INITIALIZING' | 'RUNNING' | 'STOPPED' | 'ERROR';

export interface SimulationOptions {
  /**
   * The exchange provider to use.
   * @example new Binance()
   * @see Provider
   */
  exchange: Exchange;

  /**
   * The initial balance of the account.
   * @example {'BTC': 0.1, 'ETH': 0.2}
   * @default {'USDT': 1000}
   */
  initial_balance?: Balance;

  /**
   * The time range to simulate.
   */
  timerange: {
    /**
     * The start time of the simulation.
     */
    from: Date;

    /**
     * The end time of the simulation.
     * 
     * **Note**: The end time will max be the last day of the previous month from current time. (Due to data limitations)
     * @default Date.now()
     */
    to?: Date;
  }
}

export class Simulation extends Exchange {
  #options: SimulationOptions;

  #balance: Balance;

  #currencies: {
    [key: string]: Kline
  } = {};

  constructor(options: SimulationOptions) {
    super('simulation');

    this.#options = options;
    this.#balance = options.initial_balance ?? { 'USDT': 1000 };
  }

  balance(): Promise<Balance> {
    return Promise.resolve(this.#balance);
  }

  symbols(): Promise<Symbol[]> {
    return this.#options.exchange.symbols();
  }

  time(): Promise<number> {
    return Promise.resolve(this.#cursor);
  }

  order(symbol: Symbol, options: Order): Promise<Position> {
    const price = this.#currencies[symbol.toString()][4];

    const position: Position = {
      id: `sim-${this.#cursor}`,
      symbol: symbol,
      side: options.side,
      time: this.#cursor,
      ...(options.quote ? {
        quantity: options.quantity * price,
        price: options.quantity * price / options.quantity
      } : {
        quantity: options.quantity,
        price: options.price || price
      }),
    }

    return Promise.resolve(position);
  }

  cancel(_symbol: Symbol, _id: string | Position): Promise<boolean> {
    return Promise.resolve(false); // Always return false, because we don't have any orders to cancel.
  }

  /** -1 would mean the simulation is not started or has been stopped. */
  #cursor = -1;

  async *stream(symbols: [Symbol, Interval][]): AsyncGenerator<[Symbol, Kline, Interval], void, unknown> {
    this.status = 'RUNNING';

    try {
      for await (const [symbol, kline, interval] of this.#options.exchange.history(symbols, {
        from: this.#cursor !== -1 ? new Date(this.#cursor) : this.#options.timerange.from,
        to: this.#options.timerange.to ?? new Date()
      })) {
        this.#cursor = kline[0] - 1;

        yield [symbol, kline, interval];
      }
    } catch (error) {
      this.status = 'ERROR';
      throw error;
    }

    this.status = 'STOPPED';
    this.#cursor = -1;
  }

  price(...symbols: Symbol[]): Promise<{ [key: string]: number; }> {
    return this.#options.exchange.price(...symbols);
  }

  /**
   * Stream historical klines for a symbol in a specific time range and interval.
   * @param symbols The symbols to stream.
   * @param timerange The time range to get the klines of.
   * @throws An error if the stream cannot be started.
   * @example [ [symbol('BTC', 'USD'), '1m'], [symbol('ETH', 'USD'), '1m'] ]
   * @deprecated Use stream instead.
   */
  history(symbols: [Symbol, Interval][], timerange: { from: Date; to?: Date; }): AsyncGenerator<[Symbol, Kline, Interval], void, unknown> {
    return this.#options.exchange.history(symbols, timerange);
  }

  /**
   * The status of the simulation.
   * @see Status
   */
  status: Status = 'INITIALIZING';

  /**
   * Reset the simulation.
   */
  reset(): void {
    this.status = 'INITIALIZING';
    this.#cursor = -1;
  }
}