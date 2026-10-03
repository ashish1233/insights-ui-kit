/** The HTTP plumbing shared by the hooks. Thin on purpose — no client library. */

/** Backend base URL when the app does not configure one. */
export const DEFAULT_API_BASE_URL = 'http://localhost:8000';

/** Identity service base URL when the app does not configure one. */
export const DEFAULT_IDENTITY_BASE_URL = 'http://localhost:8081';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  /** The token was rejected — expired, revoked, or for the wrong tenant. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const joinUrl = (baseUrl: string, path: string): string =>
  `${trimTrailingSlash(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Fetches JSON and turns a non-2xx response into an {@link ApiError} carrying
 * the status, so callers can distinguish an expired session (401) from a
 * genuine failure without parsing message strings.
 */
export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: { Accept: 'application/json', ...init?.headers },
    });
  } catch (cause) {
    // Network-level failure: the service is down, or CORS rejected the request.
    throw new ApiError(
      cause instanceof Error && cause.message
        ? `Could not reach the service: ${cause.message}`
        : 'Could not reach the service.',
      0,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      (await readErrorDetail(response)) ??
        `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/** Best-effort extraction of a server-supplied message; never throws. */
async function readErrorDetail(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object') {
      const record = body as Record<string, unknown>;
      for (const key of ['detail', 'message', 'error'] as const) {
        if (typeof record[key] === 'string') return record[key] as string;
      }
    }
  } catch {
    // Not JSON, or an empty body. The status alone is enough.
  }
  return null;
}

/** Normalises anything thrown into a message safe to render. */
export const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong.';
