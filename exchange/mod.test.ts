import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts.ts";

import { createProvider, Provider } from './mod.ts';

Deno.test("Creating a async provider", async () => {
  const provider = createProvider<{
    base: string;
  }>((options) => ({
    balance() {
      return Promise.resolve({
        [options.base]: 100,
      });
    }
  }) as Provider);
  assertEquals(typeof provider, "function");

  const obj = provider({
    api_key: "",
    secret_key: "",
    base: "USDT",
  });

  assertEquals(typeof obj, "object");
  assertEquals(typeof obj.balance, "function");
  assertEquals((await obj.balance()).USDT, 100);
})

Deno.test("Creating a static provider", async () => {
  const provider = createProvider({
    balance() {
      return Promise.resolve({
        USDT: 10,
      });
    }
  } as unknown as Provider);
  assertEquals(typeof provider, "function");

  const obj = provider();

  assertEquals(typeof obj, "object");
  assertEquals(typeof obj.balance, "function");
  assertEquals((await obj.balance()).USDT, 10);
});