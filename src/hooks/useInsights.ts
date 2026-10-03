import { useCallback, useEffect, useRef, useState } from 'react';
import type { InsightRow, InsightsResponse } from '../types';
import {
  ApiError,
  DEFAULT_API_BASE_URL,
  fetchJson,
  joinUrl,
  toMessage,
} from '../utils/http';

export type InsightsStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error'
  /** The token was rejected. Render a sign-in-again state, not an error page. */
  | 'unauthorized';

export interface UseInsightsOptions {
  /** Bearer token. `null` leaves the hook idle. */
  token: string | null;
  /** App backend base URL. Defaults to the local backend. */
  apiUrl?: string;
  /** Set false to hold the request back, e.g. behind a tab. */
  enabled?: boolean;
  /** Called once per 401, typically to clear the stored session. */
  onUnauthorized?: () => void;
}

export interface UseInsightsResult {
  rows: InsightRow[];
  status: InsightsStatus;
  error: string | null;
  /** Re-runs the request. Safe to wire straight to a button. */
  refresh: () => void;
}

/**
 * Reads `GET /api/insights` with the bearer token.
 *
 * A 401 is modelled as its own status rather than as an error, because the two
 * need different interfaces: an error asks the user to retry, while an expired
 * session asks them to sign in again. Collapsing them is how apps end up
 * showing a blank page to someone whose token merely timed out.
 */
export function useInsights(options: UseInsightsOptions): UseInsightsResult {
  const {
    token,
    apiUrl = DEFAULT_API_BASE_URL,
    enabled = true,
    onUnauthorized,
  } = options;

  const [rows, setRows] = useState<InsightRow[]>([]);
  const [status, setStatus] = useState<InsightsStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Held in a ref so changing the callback does not re-trigger the request.
  const onUnauthorizedRef = useRef(onUnauthorized);
  onUnauthorizedRef.current = onUnauthorized;

  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    if (!token || !enabled) {
      setStatus('idle');
      setRows([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;

    setStatus('loading');
    setError(null);

    fetchJson<InsightsResponse>(joinUrl(apiUrl, '/api/insights'), {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((body) => {
        if (!active) return;
        setRows(body.rows ?? []);
        setStatus('ready');
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) return;

        if (cause instanceof ApiError && cause.isUnauthorized) {
          setRows([]);
          setStatus('unauthorized');
          setError(null);
          onUnauthorizedRef.current?.();
          return;
        }

        setRows([]);
        setStatus('error');
        setError(toMessage(cause));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [token, apiUrl, enabled, nonce]);

  return { rows, status, error, refresh };
}
