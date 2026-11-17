'use client';
import { Plus, Sparkles, Wand2 } from 'lucide-react';

/** Ciclo sin días: invita a armarlo con el arranque guiado o a crear un día desde cero. */
export function EmptyCycle({
  onSetup,
  onNewDay,
  compact = false,
}: {
  onSetup: () => void;
  onNewDay: () => void;
  compact?: boolean;
}) {
  return (
    <section
      className={`card empty-cycle ${compact ? 'empty-cycle-compact' : ''}`}
      aria-labelledby="empty-cycle-title"
    >
      <span className="empty-cycle-icon" aria-hidden="true">
        <Sparkles size={22} />
      </span>
      <h2 id="empty-cycle-title">Aún no tienes rutina</h2>
      {!compact && <p>Arma tu ciclo en dos minutos o crea un día desde cero.</p>}
      <button type="button" className="lime-btn" onClick={onSetup}>
        <Wand2 size={17} aria-hidden="true" /> Armar mi ciclo
      </button>
      <button type="button" className="text-link" onClick={onNewDay}>
        <Plus size={15} aria-hidden="true" /> Crear un día desde cero
      </button>
    </section>
  );
}
