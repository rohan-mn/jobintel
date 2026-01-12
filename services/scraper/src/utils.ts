export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetries<T>(
  fn: () => Promise<T>,
  opts?: { tries?: number; baseDelayMs?: number }
): Promise<T> {
  const tries = opts?.tries ?? 3;
  const baseDelayMs = opts?.baseDelayMs ?? 500;

  let lastErr: unknown;

  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt === tries) break;

      // exponential backoff + small jitter
      const backoff = baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 200);
      await sleep(backoff + jitter);
    }
  }

  throw lastErr;
}
