// deno-lint-ignore-file no-explicit-any
import { Series } from '../../analysis/mod.ts';
import * as math from './mod.ts';

function test(fn: (series: Series<number>) => void, native: false): Series<number>;
function test(fn: (value: number) => number, native: true): Series<number>;
function test(fn: (arg: any) => any, native: boolean) {
  const series = new Array(100).fill(0).map((_, i) => i * 2)
  if(native) {
    for (let i = 0; i < series.length; i++) {
      series[i] = fn(series.at(i));
    }
  } else {
    const indicator = fn(series);
    for (let i = 0; i < series.length; i++) {
      series[i] = indicator.at(i);
    }
  }
  return series;
}

Deno.bench("warmup", () => { });

Deno.bench("Math.abs (native)", { group: "abs" }, () => {
  test(value => Math.abs(value), true);
})

Deno.bench("Math.abs", { group: "abs", baseline: true }, () => {
  test(series => math.abs(series), false);
})

Deno.bench("Math.acos (native)", { group: "acos" }, () => {
  test(value => Math.acos(value), true);
})

Deno.bench("Math.acos", { group: "acos", baseline: true }, () => {
  test(series => math.acos(series), false);
})

Deno.bench("Math.asin (native)", { group: "asin" }, () => {
  test(value => Math.asin(value), true);
});

Deno.bench("Math.asin", { group: "asin", baseline: true }, () => {
  test(series => math.asin(series), false);
});

Deno.bench("Math.atan (native)", { group: "atan" }, () => {
  test(value => Math.atan(value), true);
});

Deno.bench("Math.atan", { group: "atan", baseline: true }, () => {
  test(series => math.atan(series), false);
});

Deno.bench("Math.ceil (native)", { group: "ceil" }, () => {
  test(value => Math.ceil(value), true);
});

Deno.bench("Math.ceil", { group: "ceil", baseline: true }, () => {
  test(series => math.ceil(series), false);
});

Deno.bench("Math.cos (native)", { group: "cos" }, () => {
  test(value => Math.cos(value), true);
});

Deno.bench("Math.cos", { group: "cos", baseline: true }, () => {
  test(series => math.cos(series), false);
});

Deno.bench("Math.exp (native)", { group: "exp" }, () => {
  test(value => Math.exp(value), true);
});

Deno.bench("Math.exp", { group: "exp", baseline: true }, () => {
  test(series => math.exp(series), false);
});

Deno.bench("Math.floor (native)", { group: "floor" }, () => {
  test(value => Math.floor(value), true);
});

Deno.bench("Math.floor", { group: "floor", baseline: true }, () => {
  test(series => math.floor(series), false);
});

Deno.bench("Math.log (native)", { group: "log" }, () => {
  test(value => Math.log(value), true);
});

Deno.bench("Math.log", { group: "log", baseline: true }, () => {
  test(series => math.log(series), false);
});

Deno.bench("Math.log10 (native)", { group: "log10" }, () => {
  test(value => Math.log10(value), true);
});

Deno.bench("Math.log10", { group: "log10", baseline: true }, () => {
  test(series => math.log10(series), false);
});

Deno.bench("Math.max (native)", { group: "max" }, () => {
  test(value => Math.max(value, 10, 20), true);
})

Deno.bench("Math.max", { group: "max", baseline: true }, () => {
  test(series => math.max(series, 10), false);
})

Deno.bench("Math.min (native)", { group: "min" }, () => {
  test(value => Math.min(value, 10, 20), true);
});

Deno.bench("Math.min", { group: "min", baseline: true }, () => {
  test(series => math.min(series, 10), false);
});

Deno.bench("Math.pow (native)", { group: "pow" }, () => {
  test(value => Math.pow(value, 2), true);
});

Deno.bench("Math.pow", { group: "pow", baseline: true }, () => {
  test(series => math.pow(series, 2), false);
});

Deno.bench("Math.round (native)", { group: "round" }, () => {
  test(value => Math.round(value), true);
});

Deno.bench("Math.round", { group: "round", baseline: true }, () => {
  test(series => math.round(series), false);
});

Deno.bench("Math.sign (native)", { group: "sign" }, () => {
  test(value => Math.sign(value), true);
});

Deno.bench("Math.sign", { group: "sign", baseline: true }, () => {
  test(series => math.sign(series), false);
});

Deno.bench("Math.sin (native)", { group: "sin" }, () => {
  test(value => Math.sin(value), true);
});

Deno.bench("Math.sin", { group: "sin", baseline: true }, () => {
  test(series => math.sin(series), false);
});

Deno.bench("Math.sqrt (native)", { group: "sqrt" }, () => {
  test(value => Math.sqrt(value), true);
});

Deno.bench("Math.sqrt", { group: "sqrt", baseline: true }, () => {
  test(series => math.sqrt(series), false);
});

Deno.bench("Math.tan (native)", { group: "tan" }, () => {
  test(value => Math.tan(value), true);
});

Deno.bench("Math.tan", { group: "tan", baseline: true }, () => {
  test(series => math.tan(series), false);
});

Deno.bench("Math.sum", () => {
  test(series => math.sum(series, 16), false);
});

Deno.bench("Math.avg", () => {
  test(series => math.avg(series, 16), false);
});

Deno.bench("Math.diff", () => {
  test(series => math.diff(series, 16), false);
});

Deno.bench("Math.mul", () => {
  test(series => math.mul(series, 16), false);
});

Deno.bench("Math.div", () => {
  test(series => math.div(series, 16), false);
});

Deno.bench("Math.sub", () => {
  test(series => math.sub(series, 16), false);
});

Deno.bench("Math.add", () => {
  test(series => math.add(series, 16), false);
});

Deno.bench("Math.clamp", { group: "clamp", baseline: true }, () => {
  test(series => math.clamp(series, 5, 20), false);
});

Deno.bench("Math.clamp (native)", { group: "clamp" }, () => {
  test(value => Math.min(Math.max(value, 5), 20), true);
});