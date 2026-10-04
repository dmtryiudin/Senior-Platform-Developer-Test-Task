// Backend base URL. The browser goes through the port published on the host;
// server-side code (Server Components, route handlers) runs inside the frontend
// container, where the backend is reachable via the Docker network.
export const API_URL =
  typeof window === 'undefined'
    ? (process.env.API_INTERNAL_URL ?? 'http://localhost:3001')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001');

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Fetches `path` from the backend and returns the parsed JSON body.
// Throws ApiError on a non-2xx response.
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);

  if (!res.ok) {
    // Nest error bodies look like { statusCode, message: string | string[], error }.
    const body = (await res.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : (body?.message ?? res.statusText);
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}
