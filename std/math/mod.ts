import { Indicator, Series } from "../../analysis/mod.ts";

function map<V, T>(series: Series<V>, fn: (value: V, index: number) => T): Series<T> {
  return new Indicator((i) => {
    return fn(series.at(i) as V, i);
  }, series.length);
}

/**
 * Absolute value of `number` is `number` if `number` >= 0, or -`number` otherwise.
 * @returns The absolute value of `number`.
 */
export function abs(source: Series<number>): Series<number> {
  return map(source, Math.abs);
}

/**
 * The acos function returns the arccosine (in radians) of number such that cos(acos(y)) = y for y in range [-1, 1].
 * @returns The arc cosine of a value; the returned angle is in the range [0, Pi], or na if y is outside of range [-1, 1].
 */
export function acos(source: Series<number>): Series<number> {
  return map(source, Math.acos);
}

/**
 * The asin function returns the arcsine (in radians) of number such that sin(asin(y)) = y for y in range [-1, 1].
 * @returns The arcsine of a value; the returned angle is in the range [-Pi/2, Pi/2], or na if y is outside of range [-1, 1].
 */
export function asin(source: Series<number>): Series<number> {
  return map(source, Math.asin);
}

/**
 * The atan function returns the arctangent (in radians) of number such that tan(atan(y)) = y for any y.
 * @returns The arc tangent of a value; the returned angle is in the range [-Pi/2, Pi/2].
 */
export function atan(source: Series<number>): Series<number> {
  return map(source, Math.atan);
}

/**
 * The ceil function returns the smallest (closest to negative infinity) integer that is greater than or equal to the argument.
 * @returns The smallest integer greater than or equal to the given number.
 * @see floor
 * @see round
 */
export function ceil(source: Series<number>): Series<number> {
  return map(source, Math.ceil);
}

/**
 * The cos function returns the trigonometric cosine of an angle.
 * @returns The trigonometric cosine of an angle.
 */
export function cos(source: Series<number>): Series<number> {
  return map(source, Math.cos);
}

/**
 * The exp function of `number` is e raised to the power of `number`, where e is Euler's number.
 * @returns A value representing e raised to the power of `number`.
 * @see pow
 */
export function exp(source: Series<number>): Series<number> {
  return map(source, Math.exp);
}

/**
 * The floor function returns the largest (closest to positive infinity) integer that is less than or equal to the argument.
 * @returns The largest integer less than or equal to the given number.
 * @see ceil
 * @see round
 */
export function floor(source: Series<number>): Series<number> {
  return map(source, Math.floor);
}

/**
 * Natural logarithm of any `number` > 0 is the unique y such that e^y = `number`.
 * @returns The natural logarithm of `number`.
 * @see log10
 */
export function log(source: Series<number>): Series<number> {
  return map(source, Math.log);
}

/**
 * The common (or source 10) logarithm of `number` is the power to which 10 must be raised to obtain the `number`. 10^y = `number`.
 * @returns The source 10 logarithm of `number`.
 * @see log
 */
export function log10(source: Series<number>): Series<number> {
  return map(source, Math.log10);
}

/**
 * Returns the greatest of multiple values.
 * @returns The greatest of multiple given values.
 * @see min
 */
export function max(...source: (Series<number> | number)[]): Series<number> {
  const length = source.reduce((acc: number, cur) =>
    Math.max(acc, typeof cur === 'number' ? 0 : cur.length), 0);
  return new Indicator((i) => {
    let max = -Infinity;
    for (const s of source) {
      if (typeof s === 'number') {
        max = Math.max(max, s);
      } else {
        max = Math.max(max, s.at(i) ?? -Infinity);
      }
    }
    return max;
  }, length);
}

/**
 * Returns the smallest of multiple values.
 * @returns The smallest of multiple given values.
 * @see max
 */
export function min(...source: (Series<number> | number)[]): Series<number> {
  const length = source.reduce((acc: number, cur) =>
    Math.max(acc, typeof cur === 'number' ? 0 : cur.length), 0);
  return new Indicator((i) => {
    let min = Infinity;
    for (const s of source) {
      if (typeof s === 'number') {
        min = Math.min(min, s);
      } else {
        min = Math.min(min, s.at(i) ?? Infinity);
      }
    }
    return min;
  }, length);
}

/**
 * Mathematical power function.
 * @returns `source` raised to the power of `exponent`. If `source` is a series, it is calculated elementwise.
 * @see sqrt
 * @see exp
 */
export function pow(source: Series<number>, exponent: number): Series<number> {
  return map(source, (value) => Math.pow(value, exponent));
}

/**
 * Returns the value of `number` rounded to the nearest integer, with ties rounding up. If the `precision` parameter is used, returns a float value rounded to that amount of decimal places.
 * @returns The value of `number` rounded to the nearest integer, or according to precision.
 * @see ceil
 * @see floor
 */
export function round(source: Series<number>): Series<number> {
  return map(source, Math.round);
}

/**
 * Sign (signum) of `number` is zero if `number` is zero, 1.0 if `number` is greater than zero, -1.0 if `number` is less than zero.
 * @returns The sign of the argument.
 */
export function sign(source: Series<number>): Series<number> {
  return map(source, Math.sign);
}

/**
 * The sin function returns the trigonometric sine of an angle.
 * @returns The trigonometric sine of an angle.
 */
export function sin(source: Series<number>): Series<number> {
  return map(source, Math.sin);
}

/**
 * Square root of any `number` >= 0 is the unique y >= 0 such that y^2 = `number`.
 * @returns The square root of `number`.
 * @see pow
 */
export function sqrt(source: Series<number>): Series<number> {
  return map(source, Math.sqrt);
}

/**
 * The tan function returns the trigonometric tangent of an angle.
 * @returns The trigonometric tangent of an angle.
 */
export function tan(source: Series<number>): Series<number> {
  return map(source, Math.tan);
}

/**
 * The sum function returns the sliding sum of last y values of x.
 * @returns Sum of `source` for `length` bars back.
 */
export function sum(source: Series<number>, length: number): Series<number> {
  return map(source, (_, i) => {
    let sum = 0;
    for (let j = 0; j < length; j++) {
      sum += i + j < source.length ? source.at(i + j) ?? 0 : 0;
    }
    return sum;
  });
}

/**
 * The avg function returns the sliding average of last y values of x.
 * @returns Average of `source` for `length` bars back.
 * @see sum
 */
export function avg(source: Series<number>, length: number): Series<number> {
  return map(source, (_, i) => {
    let sum = 0;
    for (let j = 0; j < length; j++) {
      sum += i + j < source.length ? source.at(i + j) ?? 0 : 0;
    }
    return sum / length;
  });
}

/**
 * The diff function returns the sliding difference of last y values of x.
 * @returns Difference of `source` for `length` bars back.
 */
export function diff(source: Series<number>, length: number): Series<number> {
  return map(source, (value, i) => {
    return (i + length < source.length ? source.at(i + length) ?? 0 : value) - value;
  });
}

/**
 * The mul function returns the sliding product of last y values of x.
 * @returns Product of `source` multiplied by `multiplier`.
 * @see div
 */
export function mul(source: Series<number>, multiplier: number): Series<number> {
  return map(source, (value, i) => {
    return (i < source.length ? source.at(i) ?? 0 : value) * multiplier;
  });
}

/**
 * The div function returns the sliding quotient of last y values of x.
 * @returns Quotient of `source` divided by `divisor`.
 * @see mul
 **/
export function div(source: Series<number>, divisor: number): Series<number> {
  return map(source, (value, i) => {
    return (i < source.length ? source.at(i) ?? 0 : value) / divisor;
  });
}

/**
 * The sub function returns the sliding subtraction of last y values of x.
 * @returns Difference of `source` and `subtrahend`.
 * @see add
 */
export function sub(source: Series<number>, subtrahend: number): Series<number> {
  return map(source, (value, i) => {
    return (i < source.length ? source.at(i) ?? 0 : value) - subtrahend;
  });
}

/**
 * The add function returns the sliding sum of last y values of x.
 * @returns Sum of `source` and `addend`.
 * @see sub
 */
export function add(source: Series<number>, addend: number): Series<number> {
  return map(source, (value, i) => {
    return (i < source.length ? source.at(i) ?? 0 : value) + addend;
  });
}

/**
 * The clamp function returns the value of `number` clamped to the range `min` to `max`.
 * @returns The value of `number` clamped to the range `min` to `max`.
 */
export function clamp(source: Series<number>, min: number, max: number): Series<number> {
  return map(source, (value) => Math.min(Math.max(value, min), max));
}

/**
 * The gt function returns the boolean value of `number` > `target`.
 * @returns The boolean value of `number` > `target`.
 * @see gte
 */
export function gt(source: Series<number>, target: Series<number> | number): Series<boolean> {
  return map(source, (value, i) => value > (typeof target === 'number' ? target : target.at(i) as number));
}

/**
 * The gte function returns the boolean value of `number` >= `target`.
 * @returns The boolean value of `number` >= `target`.
 * @see gt
 */
export function gte(source: Series<number>, target: Series<number> | number): Series<boolean> {
  return map(source, (value, i) => value >= (typeof target === 'number' ? target : target.at(i) as number));
}

/**
 * The lt function returns the boolean value of `number` < `target`.
 * @returns The boolean value of `number` < `target`.
 * @see lte
 */
export function lt(source: Series<number>, target: Series<number> | number): Series<boolean> {
  return map(source, (value, i) => value < (typeof target === 'number' ? target : target.at(i) as number));
}

/**
 * The lte function returns the boolean value of `number` <= `target`.
 * @returns The boolean value of `number` <= `target`.
 * @see lt
 */
export function lte(source: Series<number>, target: Series<number> | number): Series<boolean> {
  return map(source, (value, i) => value <= (typeof target === 'number' ? target : target.at(i) as number));
}

/**
 * The eq function returns the boolean value of `number` == `target`.
 * @returns The boolean value of `number` == `target`.
 * @see neq
 */
export function eq(source: Series<number>, target: Series<number> | number): Series<boolean> {
  return map(source, (value, i) => value === (typeof target === 'number' ? target : target.at(i) as number));
}

/**
 * The neq function returns the boolean value of `number` != `target`.
 * @returns The boolean value of `number` != `target`.
 * @see eq
 */
export function neq(source: Series<number>, target: Series<number> | number): Series<boolean> {
  return map(source, (value, i) => value !== (typeof target === 'number' ? target : target.at(i) as number));
}