type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

const DEFAULT_TIMEOUT_MS = 10000;

export async function fetchJson<T>(url: string, init?: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null) as ApiEnvelope<T> | null;

    if (!response.ok) {
      throw new Error(payload?.error ?? `Request failed with status ${response.status}`);
    }

    if (payload?.success === false) {
      throw new Error(payload.error ?? "Request failed");
    }

    return (payload && "data" in payload ? payload.data : payload) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out after 10 seconds.");
    }

    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
