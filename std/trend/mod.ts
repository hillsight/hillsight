import { Indicator, Series } from "../../analysis/mod.ts";

function map<V, T>(series: Series<V>, fn: (value: V, index: number) => T): Series<T> {
  return new Indicator(function (this: Series<T>, i) {
    return fn.call(this, series.at(i) as V, i);
  }, series.length);
}

/**
 * **Simple Moving Average (SMA)**
 * 
 * The sma function returns the moving average, that is the sum of last y values of x, divided by y.
 * @param source Series of values to process.
 * @param length Number of bars (length).
 * @returns Simple moving average of `source` for `length` bars back.
 */
export function sma(source: Series<number>, length: number) {
  return map(source, (_, i) => {
    let sum = 0;
    for (let j = 0; j < length; j++) {
      sum += source.at(i + j) as number;
    }
    if (isNaN(sum)) return 0;
    return sum / length;
  });
}

/**
 * **Exponential Moving Average (EMA)**
 * 
 * The ema function returns the exponential moving average, that is the sum of last y values of x, divided by y.
 * @param source Series of values to process.
 * @param length Number of bars (length).
 * @returns Exponential moving average of `source` for `length` bars back.
 */
export function ema(source: Series<number>, length: number) {
  return map(source, function (this: Series<number>, _, i): number {
    if (i === 0) return source.at(i) as number;
    const p = this.at(i - 1) as number;
    return (source.at(i) as number - p) * (2 / (length + 1)) + p;
  });
}