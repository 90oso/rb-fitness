'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PHONE_QUERY } from '@/lib/layout';

/** Cuánto hay que bajar (acumulado, en un mismo sentido) antes de esconder la barra. */
const HIDE_AFTER = 12;
/** Cuánto hay que subir para que reaparezca. Más corto que el anterior: volver tiene que ser fácil. */
const REVEAL_AFTER = 6;
/** Cerca del tope la barra siempre se ve. */
const TOP_ZONE = 64;
/** En páginas casi sin recorrido no tiene sentido esconderla. */
const MIN_SCROLLABLE = 160;

/**
 * Esconde la barra superior al bajar y la devuelve en cuanto se sube un poco (solo en móvil).
 *
 * - `resetKey` cambia al navegar (pestaña o ventana abierta): la barra vuelve a mostrarse.
 * - `reveal()` la muestra a mano; se usa cuando algo dentro de ella recibe el foco con el teclado.
 * - Escucha `scroll` en modo pasivo y trabaja en un frame de animación, sin tocar el layout.
 */
export function useHideOnScroll(resetKey: string) {
  const [state, setState] = useState({ key: resetKey, hidden: false });
  const hidden = state.key === resetKey && state.hidden;
  const lastY = useRef(0);
  const travel = useRef(0);
  const frame = useRef(0);
  const keyRef = useRef(resetKey);

  const set = useCallback((next: boolean) => {
    setState((prev) =>
      prev.key === keyRef.current && prev.hidden === next ? prev : { key: keyRef.current, hidden: next }
    );
  }, []);

  useEffect(() => {
    keyRef.current = resetKey;
    lastY.current = window.scrollY;
    travel.current = 0;
  }, [resetKey]);

  useEffect(() => {
    const media = window.matchMedia(PHONE_QUERY);

    const update = () => {
      frame.current = 0;
      if (!media.matches) {
        set(false);
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // El rebote de iOS pasa de los límites: se recorta para no leerlo como un gesto.
      const y = Math.min(Math.max(window.scrollY, 0), Math.max(max, 0));
      const delta = y - lastY.current;
      lastY.current = y;

      if (y <= TOP_ZONE || max < MIN_SCROLLABLE) {
        travel.current = 0;
        set(false);
        return;
      }
      if (delta === 0) return;
      // Se acumula el recorrido en un mismo sentido; un cambio de sentido empieza de cero.
      travel.current = Math.sign(delta) === Math.sign(travel.current) ? travel.current + delta : delta;
      if (travel.current >= HIDE_AFTER) set(true);
      else if (travel.current <= -REVEAL_AFTER) set(false);
    };

    const onScroll = () => {
      if (!frame.current) frame.current = window.requestAnimationFrame(update);
    };
    const onChange = () => {
      travel.current = 0;
      lastY.current = window.scrollY;
      if (!media.matches) set(false);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    media.addEventListener('change', onChange);
    return () => {
      window.removeEventListener('scroll', onScroll);
      media.removeEventListener('change', onChange);
      if (frame.current) window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [set]);

  const reveal = useCallback(() => {
    travel.current = 0;
    set(false);
  }, [set]);

  return { hidden, reveal };
}
