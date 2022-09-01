import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";

import * as TA from './mod.ts';

const numbers = (i = 10) => new Array(i).fill(0).map((_, v) => (i - v - 1) * 2);

console.log(numbers())

Deno.test("SMA", () => {
  assertEquals(
    Array.from(TA.sma(numbers(), 3)),
    [16, 14, 12, 10, 8, 6, 4, 2, 0, 0]
  );
});

Deno.test("EMA", () => {
  assertEquals(
    Array.from(TA.ema(numbers(), 3)),
    [18, 17, 15.5, 13.75, 11.875, 9.9375, 7.96875, 5.984375, 3.9921875, 1.99609375]
  );
});