import { Series } from '../../analysis/mod.ts';
import * as TA from './mod.ts';

function test(fn: (series: Series<number>) => Series<number>) {
  const series = new Array(100).fill(0).map((_, i) => i * 2)
  const indicator = fn(series);
  for (let i = 0; i < series.length; i++) {
    series[i] = indicator.at(i) as number;
  }
  return series;
}

Deno.bench("warmup", () => { });

Deno.bench("SMA", () => {
  test(series => TA.sma(series, 3));
})

Deno.bench("EMA", () => {
  test(series => TA.ema(series, 3));
});