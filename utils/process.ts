const decoder = new TextDecoder();

export type ProcessOutput = {
  status: Deno.ProcessStatus;
  stderr: string;
  stdout: string;
};

/**
 * Convenience wrapper around subprocess API.
 * Requires permission `--allow-run`.
 */
export async function run(cmd: string[]): Promise<ProcessOutput> {
  const process = Deno.run({ cmd, stderr: "piped", stdout: "piped" });

  const [status, stderr, stdout] = await Promise.all([
    process.status(),
    decoder.decode(await process.stderrOutput()),
    decoder.decode(await process.output()),
  ]);

  if (stderr) {
    throw new Error(`Error running command: ${stderr}`);
  }

  process.close();
  return { status, stderr, stdout };
}
