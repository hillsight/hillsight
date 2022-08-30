import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";

import * as math from './mod.ts';

const numbers = (i = 3) => new Array(i).fill(0).map((_, v) => (i - v - 1) * 2);

Deno.test("Math.abs", () => {
  assertEquals(
    Array.from(math.abs(numbers().map(v => -v))),
    [4, 2, 0]
  );
});

Deno.test("Math.acos", () => {
  assertEquals(
    Array.from(math.acos(numbers())),
    [Math.acos(4), Math.acos(2), Math.acos(0)]
  );
});

Deno.test("Math.asin", () => {
  assertEquals(
    Array.from(math.asin(numbers())),
    [Math.asin(4), Math.asin(2), Math.asin(0)]
  );
});

Deno.test("Math.atan", () => {
  assertEquals(
    Array.from(math.atan(numbers())),
    [Math.atan(4), Math.atan(2), Math.atan(0)]
  );
});

Deno.test("Math.ceil", () => {
  assertEquals(
    Array.from(math.ceil(numbers().map(v => v / 1.75))),
    [3, 2, 0]
  );
});

Deno.test("Math.cos", () => {
  assertEquals(
    Array.from(math.cos(numbers())),
    [Math.cos(4), Math.cos(2), Math.cos(0)]
  );
});

Deno.test("Math.exp", () => {
  assertEquals(
    Array.from(math.exp(numbers())),
    [Math.exp(4), Math.exp(2), Math.exp(0)]
  );
});

Deno.test("Math.floor", () => {
  assertEquals(
    Array.from(math.floor(numbers().map(v => v / 1.25))),
    [3, 1, 0]
  );
});

Deno.test("Math.log", () => {
  assertEquals(
    Array.from(math.log(numbers())),
    [Math.log(4), Math.log(2), Math.log(0)]
  );
});

Deno.test("Math.log10", () => {
  assertEquals(
    Array.from(math.log10(numbers())),
    [Math.log10(4), Math.log10(2), Math.log10(0)]
  );
});

Deno.test("Math.max", () => {
  assertEquals(
    Array.from(math.max(numbers(), 3)),
    [4, 3, 3]
  );
});

Deno.test("Math.min", () => {
  assertEquals(
    Array.from(math.min(numbers(), 3)),
    [3, 2, 0]
  );
});

Deno.test("Math.pow", () => {
  assertEquals(
    Array.from(math.pow(numbers(), 2)),
    [16, 4, 0]
  );
});

Deno.test("Math.round", () => {
  assertEquals(
    Array.from(math.round(numbers().map(v => v / 1.5))),
    [3, 1, 0]
  );
});

Deno.test("Math.sign", () => {
  assertEquals(
    Array.from(math.sign(numbers())),
    [1, 1, 0]
  );
});

Deno.test("Math.sin", () => {
  assertEquals(
    Array.from(math.sin(numbers())),
    [Math.sin(4), Math.sin(2), Math.sin(0)]
  );
});

Deno.test("Math.sqrt", () => {
  assertEquals(
    Array.from(math.sqrt(numbers())),
    [Math.sqrt(4), Math.sqrt(2), Math.sqrt(0)]
  );
});

Deno.test("Math.tan", () => {
  assertEquals(
    Array.from(math.tan(numbers())),
    [Math.tan(4), Math.tan(2), Math.tan(0)]
  );
});

Deno.test("Math.sum", () => {
  assertEquals(
    Array.from(math.sum(numbers(10), 3)),
    [48, 42, 36, 30, 24, 18, 12, 6, 2, 0]
  );
  assertEquals(
    Array.from(math.sum(numbers(10), 10)),
    [90, 72, 56, 42, 30, 20, 12, 6, 2, 0]
  );
});

Deno.test("Math.avg", () => {
  assertEquals(
    Array.from(math.avg(numbers(5), 2)),
    [7, 5, 3, 1, 0]
  );
});

Deno.test("Math.diff", () => {
  const series = numbers(5).map((_, i) => Math.round(10 * Math.sin(i)));
  assertEquals(
    Array.from(math.diff(series, 1)),
    [8, 1, -8, -9, 0]
  );
});

Deno.test("Math.mul", () => {
  assertEquals(
    Array.from(math.mul(numbers(), 2)),
    [8, 4, 0]
  );
});

Deno.test("Math.div", () => {
  assertEquals(
    Array.from(math.div(numbers(), 2)),
    [2, 1, 0]
  );
});

Deno.test("Math.sub", () => {
  assertEquals(
    Array.from(math.sub(numbers(), 2)),
    [2, 0, -2]
  );
});

Deno.test("Math.add", () => {
  assertEquals(
    Array.from(math.add(numbers(), 2)),
    [6, 4, 2]
  );
});

Deno.test("Math.clamp", () => {
  assertEquals(
    Array.from(math.clamp(numbers(), 1, 3)),
    [3, 2, 1]
  );
});

Deno.test("Math.gt", () => {
  assertEquals(
    Array.from(math.gt(numbers(), 2)),
    [true, false, false]
  );
  assertEquals(
    Array.from(math.gt([0, 1, 2, 3, 4, 5], [5, 4, 3, 2, 1, 0])),
    [false, false, false, true, true, true]
  );
});

Deno.test("Math.gte", () => {
  assertEquals(
    Array.from(math.gte(numbers(), 2)),
    [true, true, false]
  );
  assertEquals(
    Array.from(math.gte([0, 1, 2, 3, 4, 5], [5, 4, 3, 2, 1, 0])),
    [false, false, false, true, true, true]
  );
});

Deno.test("Math.lt", () => {
  assertEquals(
    Array.from(math.lt(numbers(), 2)),
    [false, false, true]
  );
  assertEquals(
    Array.from(math.lt([0, 1, 2, 3, 4, 5], [5, 4, 3, 2, 1, 0])),
    [true, true, true, false, false, false]
  );
});

Deno.test("Math.lte", () => {
  assertEquals(
    Array.from(math.lte(numbers(), 2)),
    [false, true, true]
  );
  assertEquals(
    Array.from(math.lte([0, 1, 2, 3, 4, 5], [5, 4, 3, 2, 1, 0])),
    [true, true, true, false, false, false]
  );
});

Deno.test("Math.eq", () => {
  assertEquals(
    Array.from(math.eq(numbers(), 2)),
    [false, true, false]
  );
  assertEquals(
    Array.from(math.eq([0, 1, 2, 3, 4, 5], [5, 4, 2, 1, 0, 5])),
    [false, false, true, false, false, true]
  );
});

Deno.test("Math.neq", () => {
  assertEquals(
    Array.from(math.neq(numbers(), 2)),
    [true, false, true]
  );
  assertEquals(
    Array.from(math.neq([0, 1, 2, 3, 4, 5], [5, 4, 2, 1, 0, 5])),
    [true, true, false, true, true, false]
  );
});