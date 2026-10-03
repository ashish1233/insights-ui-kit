import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session, TokenRequest, TokenResponse } from '../types';
import {
  DEFAULT_IDENTITY_BASE_URL,
  fetchJson,
  joinUrl,
  toMessage,
} from '../utils/http';

const DEFAULT_STORAGE_KEY = 'insights.session';

export interface UseAuthOptions {
  /** Identity service base URL. Defaults to the local stub. */
  identityUrl?: string;
  /** localStorage key. Change it if two apps share an origin. */
  storageKey?: string;
  /** Scopes requested at sign-in, unless `login` overrides them. */
  scopes?: string[];
}

export interface LoginArgs {
  tenantId: string;
  subject: string;
  scopes?: string[];
}

export interface UseAuthResult {
  session: Session | null;
  token: string | null;
  isAuthenticated: boolean;
  /** `signing-in` while the token request is in flight. */
  status: 'idle' | 'signing-in';
  /** Sign-in failure message, cleared on the next attempt. */
  error: string | null;
  /** True when the last sign-out was caused by a rejected token, not the user. */
  expired: boolean;
  login: (args: LoginArgs) => Promise<void>;
  logout: (options?: { expired?: boolean }) => void;
}

function readSession(storageKey: string): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as Session).token === 'string'
    ) {
      return parsed as Session;
    }
  } catch {
    // Corrupt or inaccessible storage is treated as "not signed in".
  }
  return null;
}

/**
 * Holds the session token.
 *
 * The token lives in `localStorage`, which is a deliberate and limited choice:
 * it survives a reload, which is what a reporting tool needs, and it is exposed
 * to any script running on the origin, which is why these are short-lived
 * tokens from the platform's identity service rather than long-lived
 * credentials. An app that needs stronger handling should use httpOnly cookies
 * and not this hook.
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const {
    identityUrl = DEFAULT_IDENTITY_BASE_URL,
    storageKey = DEFAULT_STORAGE_KEY,
    scopes: defaultScopes,
  } = options;

  const [session, setSession] = useState<Session | null>(() =>
    readSession(storageKey),
  );
  const [status, setStatus] = useState<'idle' | 'signing-in'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  // Keeps the latest defaults available to the stable `login` callback.
  const configRef = useRef({ identityUrl, storageKey, defaultScopes });
  configRef.current = { identityUrl, storageKey, defaultScopes };

  // Signing out in one tab signs out the others.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) setSession(readSession(storageKey));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  const login = useCallback(async (args: LoginArgs) => {
    const config = configRef.current;
    const scopes = args.scopes ?? config.defaultScopes ?? [];

    setStatus('signing-in');
    setError(null);
    setExpired(false);

    try {
      const body: TokenRequest = {
        tenant_id: args.tenantId,
        subject: args.subject,
        scopes,
      };

      const { token } = await fetchJson<TokenResponse>(
        joinUrl(config.identityUrl, '/token/user'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );

      const next: Session = {
        token,
        tenantId: args.tenantId,
        subject: args.subject,
        scopes,
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(config.storageKey, JSON.stringify(next));
      }
      setSession(next);
    } catch (cause) {
      setError(toMessage(cause));
      setSession(null);
    } finally {
      setStatus('idle');
    }
  }, []);

  const logout = useCallback((logoutOptions?: { expired?: boolean }) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(configRef.current.storageKey);
    }
    setSession(null);
    setError(null);
    setExpired(Boolean(logoutOptions?.expired));
  }, []);

  return {
    session,
    token: session?.token ?? null,
    isAuthenticated: session !== null,
    status,
    error,
    expired,
    login,
    logout,
  };
}
