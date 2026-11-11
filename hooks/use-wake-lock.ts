'use client';
import { useEffect } from 'react';

/**
 * Mantiene la pantalla encendida mientras `enabled` (solo durante la sesión, en la pestaña Entrenar).
 * El sistema suelta el bloqueo al pasar a segundo plano; se vuelve a pedir al volver. Sin la API no pasa nada.
 */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let active = true;
    const request = async () => {
      if (!active || document.visibilityState !== 'visible') return;
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        sentinel = null; // batería baja o pestaña oculta: el sistema lo rechaza y seguimos sin él
      }
    };
    const onVisible = () => void request();
    document.addEventListener('visibilitychange', onVisible);
    void request();
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [enabled]);
}
