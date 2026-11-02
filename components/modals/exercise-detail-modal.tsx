'use client';
import { Check, Dumbbell, Info, X } from 'lucide-react';
import { getExercise } from '@/lib/catalog';

export default function ExerciseDetailModal({
  exerciseId,
  onClose,
}: {
  exerciseId: string;
  onClose: () => void;
}) {
  const exercise = getExercise(exerciseId);
  if (!exercise) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <X size={21} />
        </button>
        <span className="overline">GUÍA DE EQUIPAMIENTO</span>
        <div className="modal-illustration">
          <Dumbbell size={56} />
        </div>
        <h2 id="detail-title">{exercise.name}</h2>
        <div className="modal-chips">
          <span>{exercise.muscle}</span>
          <span>{exercise.equipment}</span>
        </div>
        <h3>Cómo realizarlo</h3>
        <p>{exercise.instruction}</p>
        <div className="safe-tip">
          <Info size={19} />
          <span>{exercise.tip} Si tienes dudas con una máquina, pide ayuda al personal del gimnasio.</span>
        </div>
        <button className="lime-btn modal-ok" onClick={onClose}>
          Entendido <Check size={17} />
        </button>
      </div>
    </div>
  );
}
