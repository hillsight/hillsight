import { resolve } from "https://deno.land/std@0.149.0/path/mod.ts";
import { Interval } from "../generic.ts";

export const DEFAULT_CACHE_DIR = resolve(Deno.cwd(), '.cache');
export const ACCEPTABLE_INTERVALS: Interval[] = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d'];

export { Binance } from './providers/binance.ts';