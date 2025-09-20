export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    if (typeof fetch !== "function") {
      // eslint-disable-next-line no-console
      console.warn(
        "[apiGet] fetch not available, returning fallback for",
        path,
      );
      return fallback;
    }
    const resp = await fetch(path, {
      credentials: "same-origin",
      signal: controller.signal,
    });
    if (!resp || !resp.ok) {
      // return fallback on non-OK responses to avoid throwing in queries
      return fallback;
    }
    const data = (await resp.json()) as T;
    return data;
  } catch (e: any) {
    // network error, CORS issue, or aborted - log for debugging and return fallback
    // eslint-disable-next-line no-console
    if (e && e.name === "AbortError")
      console.warn("[apiGet] request aborted (timeout)", path);
    else
      console.warn(
        "[apiGet] fetch failed",
        path,
        e && e.message ? e.message : e,
      );
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}
