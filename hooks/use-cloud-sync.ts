'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { initialData } from '@/lib/catalog';
import { readCloudState, writeCloudState } from '@/lib/cloud';
import type { AppData } from '@/lib/types';

export type SyncStatus = 'loading' | 'saved' | 'saving' | 'error';
export type DataUpdate = AppData | ((prev: AppData) => AppData);

/** Changes are batched for this long before the whole state is written to Supabase. */
export const SAVE_DEBOUNCE_MS = 600;

interface Loaded {
  forUser: string;
  data: AppData;
}
interface LoadError {
  forUser: string;
  message: string;
}

/**
 * Owns the user's AppData and keeps it in Supabase.
 * - One serialized write queue per account; optimistic revision check on the server.
 * - Writes are debounced (typing a name no longer sends one request per key).
 * - The pending write is flushed early when the tab is hidden; leaving with unsaved changes warns.
 */
export function useCloudSync(client: SupabaseClient | null, userId: string | null) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [status, setStatus] = useState<SyncStatus>('loading');
  const [error, setError] = useState('');

  const dataRef = useRef<AppData>(initialData);
  const hydratedRef = useRef(false);
  const persistedRef = useRef('');
  const revisionRef = useRef(0);
  const pendingRef = useRef(false);
  const writingRef = useRef(false);
  const accountRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const hydrated = loaded !== null && loaded.forUser === userId;
  const data = hydrated ? loaded.data : initialData;
  const effectiveStatus: SyncStatus = hydrated
    ? status
    : loadError && loadError.forUser === userId
      ? 'error'
      : 'loading';
  const effectiveError = hydrated
    ? error
    : loadError && loadError.forUser === userId
      ? loadError.message
      : '';

  const flush = useCallback(async () => {
    const user = accountRef.current;
    if (!client || !user || !hydratedRef.current || writingRef.current) return;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    writingRef.current = true;
    while (pendingRef.current && accountRef.current === user) {
      pendingRef.current = false;
      const snapshot = dataRef.current;
      const signature = JSON.stringify(snapshot);
      if (signature === persistedRef.current) continue;
      setStatus('saving');
      try {
        const revision = await writeCloudState(client, snapshot, revisionRef.current);
        if (accountRef.current !== user) break;
        revisionRef.current = revision;
        persistedRef.current = signature;
      } catch (err) {
        pendingRef.current = true;
        setError(err instanceof Error ? err.message : 'Error de sincronización');
        setStatus('error');
        break;
      }
    }
    writingRef.current = false;
    if (!pendingRef.current && accountRef.current === user) {
      setStatus('saved');
      setError('');
    }
  }, [client]);

  const schedule = useCallback(() => {
    pendingRef.current = true;
    setStatus((current) => (current === 'error' ? current : 'saving'));
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      void flush();
    }, SAVE_DEBOUNCE_MS);
  }, [flush]);

  const setData = useCallback(
    (update: DataUpdate) => {
      setLoaded((prev) => {
        if (!prev || prev.forUser !== accountRef.current) return prev; // edits before hydration are ignored
        const next = typeof update === 'function' ? update(prev.data) : update;
        if (next === prev.data) return prev;
        dataRef.current = next;
        return { forUser: prev.forUser, data: next };
      });
      schedule();
    },
    [schedule]
  );

  /** Latest data, including updates React has not rendered yet. For pure cycle operations that may throw. */
  const getData = useCallback(() => dataRef.current, []);

  useEffect(() => {
    accountRef.current = userId;
    hydratedRef.current = false;
    pendingRef.current = false;
    revisionRef.current = 0;
    persistedRef.current = '';
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!client || !userId) return;
    let live = true;
    readCloudState(client, userId)
      .then((record) => {
        if (!live || accountRef.current !== userId) return;
        revisionRef.current = record.revision;
        persistedRef.current = JSON.stringify(record.data);
        dataRef.current = record.data;
        hydratedRef.current = true;
        setLoaded({ forUser: userId, data: record.data });
        setLoadError(null);
        setStatus('saved');
        setError('');
      })
      .catch((err) => {
        if (live)
          setLoadError({
            forUser: userId,
            message: err instanceof Error ? err.message : 'Error al leer tu cuenta.',
          });
      });
    return () => {
      live = false;
    };
  }, [client, userId]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (pendingRef.current || writingRef.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    const hurry = () => {
      if (document.visibilityState === 'hidden' && pendingRef.current && timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        void flush();
      }
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('visibilitychange', hurry);
    return () => {
      window.removeEventListener('beforeunload', warn);
      document.removeEventListener('visibilitychange', hurry);
    };
  }, [flush]);

  const isBusy = useCallback(() => pendingRef.current || writingRef.current, []);

  return {
    data,
    setData,
    getData,
    hydrated,
    status: effectiveStatus,
    error: effectiveError,
    retry: flush,
    isBusy,
  };
}
