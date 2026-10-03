import { useEffect, useState } from 'react';
import type { HealthResponse } from '../types';
import {
  DEFAULT_API_BASE_URL,
  fetchJson,
  joinUrl,
  toMessage,
} from '../utils/http';

export interface UseHealthOptions {
  apiUrl?: string;
  enabled?: boolean;
}

export interface UseHealthResult {
  health: HealthResponse | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}

/**
 * Reads `GET /health` for the tenant id and isolation tier the AppShell
 * displays.
 *
 * Tier comes from the backend rather than from frontend configuration on
 * purpose: ADR-2 makes tier a property of the tenant held in platform
 * configuration, so a frontend constant could disagree with reality and would
 * be the more visible of the two. The endpoint is unauthenticated, so the shell
 * can label itself before anyone signs in.
 */
export function useHealth(options: UseHealthOptions = {}): UseHealthResult {
  const { apiUrl = DEFAULT_API_BASE_URL, enabled = true } = options;

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    let active = true;

    setStatus('loading');
    setError(null);

    fetchJson<HealthResponse>(joinUrl(apiUrl, '/health'), {
      signal: controller.signal,
    })
      .then((body) => {
        if (!active) return;
        setHealth(body);
        setStatus('ready');
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) return;
        setHealth(null);
        setStatus('error');
        setError(toMessage(cause));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [apiUrl, enabled]);

  return { health, status, error };
}
