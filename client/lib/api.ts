export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const resp = await fetch(path, { credentials: 'same-origin' });
    if (!resp.ok) {
      // return fallback on non-OK responses to avoid throwing in queries
      return fallback;
    }
    const data = (await resp.json()) as T;
    return data;
  } catch (e) {
    // network error or CORS issue - log for debugging and return fallback
    // eslint-disable-next-line no-console
    console.warn('[apiGet] fetch failed', path, e);
    return fallback;
  }
}
