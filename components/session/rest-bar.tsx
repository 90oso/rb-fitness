'use client';
import { BellRing, Timer, X } from 'lucide-react';
import { prettyDuration } from '@/lib/metrics';

/**
 * Barra de descanso que no se mueve con el scroll: en el teléfono en vertical flota sobre la navegación;
 * en horizontal y escritorio se pega arriba de la columna de registro (ver `.rest-bar` en glass.css).
 */
export default function RestBar({
  phase,
  remainingMs,
  setNumber,
  onAdjust,
  onSkip,
  onDismiss,
}: {
  phase: 'running' | 'done';
  remainingMs: number;
  setNumber: number;
  onAdjust: (deltaSeconds: number) => void;
  onSkip: () => void;
  onDismiss: () => void;
}) {
  if (phase === 'done') {
    return (
      <div className="rest-bar rest-bar-done" role="status" aria-live="polite">
        <BellRing size={19} aria-hidden="true" />
        <span className="rest-bar-text">
          Descanso terminado <span className="rest-bar-sep">·</span> Serie {setNumber}
        </span>
        <button type="button" className="rest-bar-close" onClick={onDismiss} aria-label="Cerrar aviso">
          <X size={18} />
        </button>
      </div>
    );
  }
  return (
    <div className="rest-bar" role="timer" aria-label="Descanso en curso">
      <Timer size={19} aria-hidden="true" />
      <span className="rest-bar-text">
        Descanso <strong>{prettyDuration(remainingMs / 1000)}</strong>
      </span>
      <div className="rest-bar-actions">
        <button type="button" onClick={() => onAdjust(-15)} aria-label="Quitar 15 segundos">
          −15 s
        </button>
        <button type="button" onClick={() => onAdjust(15)} aria-label="Añadir 15 segundos">
          +15 s
        </button>
        <button type="button" className="rest-bar-skip" onClick={onSkip}>
          Omitir
        </button>
      </div>
    </div>
  );
}
