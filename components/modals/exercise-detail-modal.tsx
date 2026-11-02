'use client';
import { Check, Info, X } from 'lucide-react';
import { ExerciseMotion } from '@/components/ui/exercise-media';
import { MEDIA_CREDIT, getExercise } from '@/lib/catalog';

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
        <span className="overline">CÓMO SE HACE</span>
        <h2 id="detail-title">{exercise.name}</h2>
        <div className="modal-chips">
          <span>{exercise.muscle}</span>
          <span>{exercise.equipment}</span>
        </div>
        <ExerciseMotion exercise={exercise} />
        <p>{exercise.instruction}</p>
        <div className="safe-tip">
          <Info size={19} />
          <span>{exercise.tip}</span>
        </div>
        <button className="lime-btn modal-ok" onClick={onClose}>
          Entendido <Check size={17} />
        </button>
        {exercise.media && <small className="media-credit">{MEDIA_CREDIT}</small>}
      </div>
    </div>
  );
}
