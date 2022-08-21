import { dirname, basename } from "https://deno.land/std@0.149.0/path/mod.ts";

import { download as pull } from "https://deno.land/x/download@v1.0.1/mod.ts";
import { run } from "./process.ts";

/**
 * Download a file from a URL and unzip it if necessary.
 * @param url The URL to download from.
 * @param destination The destination to download to.
 */
export async function download(
  url: string,
  destination: string,
  options?: {
    unzip?: boolean;
    mode?: number;
  }
): Promise<void> {
  const path = dirname(destination);
  const filename = basename(destination);
  if (options?.unzip) {
    // Create temporary directory.
    const temp = Deno.makeTempDirSync();
    try {
      // Download the file.
      await pull(url, {
        dir: temp,
        file: filename,
        mode: options?.mode,
      });

      // Unzip the file.
      await run(["unzip", "-o", `${temp}/${filename}`, "-d", path]);
    } catch (error) {
      // Clean up temporary directory.
      Deno.removeSync(temp, { recursive: true });
      throw error;
    }
  } else {
    // Download the file.
    await pull(url, {
      dir: path,
      file: filename,
      mode: options?.mode,
    });
  }
}