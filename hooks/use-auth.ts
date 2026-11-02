'use client';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getCloudClient } from '@/lib/cloud';

export type SessionState = 'checking' | 'signed-out' | 'signed-in';

const noop = () => () => {};
const clientSnapshot = (): SupabaseClient | null => getCloudClient();
const serverSnapshot = (): SupabaseClient | null => null;
const browserTrue = () => true;
const serverFalse = () => false;

/**
 * Supabase client + session. The client is created once on the browser and is null on the server,
 * so the server HTML renders the loading screen and the client picks the real state after hydration.
 */
export function useAuth() {
  const client = useSyncExternalStore(noop, clientSnapshot, serverSnapshot);
  // false while server-rendering and hydrating, true afterwards: lets the UI tell "not loaded yet"
  // from "Supabase not configured" without a server/client mismatch.
  const hydrated = useSyncExternalStore(noop, browserTrue, serverFalse);
  const configured: boolean | null = hydrated ? client !== null : null;
  const [session, setSession] = useState<SessionState>('checking');
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (!client) return;
    let live = true;
    const { data: listener } = client.auth.onAuthStateChange((event, current) => {
      if (!live) return;
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'SIGNED_OUT' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED' ||
        event === 'PASSWORD_RECOVERY'
      ) {
        setUserId(current?.user?.id ?? null);
        setEmail(current?.user?.email ?? null);
        setSession(current?.user ? 'signed-in' : 'signed-out');
      }
    });
    client.auth.getSession().then(({ data }) => {
      if (!live) return;
      setUserId(data.session?.user?.id ?? null);
      setEmail(data.session?.user?.email ?? null);
      setSession(data.session?.user ? 'signed-in' : 'signed-out');
    });
    return () => {
      live = false;
      listener.subscription.unsubscribe();
    };
  }, [client]);

  // 'local' ends only this device's session (used after deleting the account: the server session no longer exists).
  const signOut = useCallback(
    async (scope: 'global' | 'local' = 'global') => {
      if (!client) return;
      try {
        await client.auth.signOut({ scope });
      } finally {
        setUserId(null);
        setEmail(null);
        setSession('signed-out');
        setRecovery(false);
      }
    },
    [client]
  );

  const finishRecovery = useCallback(() => setRecovery(false), []);

  return { client, configured, session, userId, email, recovery, signOut, finishRecovery };
}
