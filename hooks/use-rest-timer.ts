'use client';
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { REST_KEY, parseRestRecord, type RestRecord } from '@/lib/session';

export type RestPhase = 'idle' | 'running' | 'done';

// El descanso vive en localStorage (única fuente): sobrevive recargas y no hay estado que hidratar a mano.
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}
function getSnapshot() {
  try {
    return localStorage.getItem(REST_KEY);
  } catch {
    return null;
  }
}
const getServerSnapshot = () => null;
function writeRecord(record: RestRecord | null) {
  try {
    if (record) localStorage.setItem(REST_KEY, JSON.stringify(record));
    else localStorage.removeItem(REST_KEY);
  } catch {
    /* sin almacenamiento no hay descanso persistente; la app sigue */
  }
  listeners.forEach((listener) => listener());
}

/**
 * Descanso entre series. `now` lo mueve el reloj de la app (un tick por segundo en sesión).
 * - `running` mientras falta tiempo; `done` cuando llegó a cero por el reloj (se queda así hasta
 *   `dismiss`, `start` o `skip`); `idle` sin descanso.
 * - `onDone` se llama una sola vez por descanso, también si la app estaba en segundo plano al vencer.
 * - Al recargar se restaura si sigue corriendo; un descanso ya vencido no se restaura.
 */
export function useRestTimer(activeId: string | null, now: number, onDone: () => void) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // -Infinity: aquí sí queremos ver un registro vencido (fase «done») hasta que se cierre.
  const record = useMemo(
    () => (activeId ? parseRestRecord(raw, activeId, -Infinity) : null),
    [raw, activeId]
  );
  const firedFor = useRef<number | null>(null);

  // Al montar: un descanso que venció mientras la app estaba cerrada no se restaura. Sin sesión no se
  // toca nada: antes de hidratar `activeId` es null un instante y el registro debe seguir ahí.
  useEffect(() => {
    const saved = activeId ? parseRestRecord(getSnapshot(), activeId, -Infinity) : null;
    if (saved && saved.endsAt <= Date.now()) writeRecord(null);
    // Solo al montar o cambiar de sesión: después, el reloj decide.
  }, [activeId]);

  const phase: RestPhase = record === null ? 'idle' : record.endsAt > now ? 'running' : 'done';
  const remainingMs = record ? Math.max(0, record.endsAt - now) : 0;

  useEffect(() => {
    if (phase === 'done' && record && firedFor.current !== record.endsAt) {
      firedFor.current = record.endsAt;
      onDone();
    }
  }, [phase, record, onDone]);

  const start = useCallback(
    (exerciseId: string, seconds: number) => {
      if (activeId) writeRecord({ activeId, exerciseId, endsAt: Date.now() + seconds * 1000 });
    },
    [activeId]
  );
  const skip = useCallback(() => writeRecord(null), []);
  const adjust = useCallback(
    (deltaSeconds: number) => {
      const current = activeId ? parseRestRecord(getSnapshot(), activeId, -Infinity) : null;
      if (!current) return;
      const endsAt = current.endsAt + deltaSeconds * 1000;
      // Quitar más tiempo del que queda equivale a omitir: termina en silencio.
      writeRecord(endsAt <= Date.now() ? null : { ...current, endsAt });
    },
    [activeId]
  );

  return { phase, remainingMs, exerciseId: record?.exerciseId ?? null, start, adjust, skip, dismiss: skip };
}
