'use client';
import { Check, Trash2, X } from 'lucide-react';
import { catalog, getExercise } from '@/lib/catalog';
import { makeRx } from '@/lib/format';
import type { Routine, RoutineExercise } from '@/lib/types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function RoutineEditorModal({
  routine,
  onChange,
  onClose,
}: {
  routine: Routine;
  onChange: (update: (routine: Routine) => Routine) => void;
  onClose: () => void;
}) {
  const patchExercise = (index: number, patch: (rx: RoutineExercise) => Partial<RoutineExercise>) =>
    onChange((current) => ({
      ...current,
      exercises: current.exercises.map((item, i) => (i === index ? { ...item, ...patch(item) } : item)),
    }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" aria-label="Cerrar" onClick={onClose}>
          <X size={21} />
        </button>
        <span className="overline">PERSONALIZAR RUTINA</span>
        <h2 id="edit-title">{routine.name}</h2>
        <label className="form-label">
          Nombre de rutina
          <input
            maxLength={65}
            value={routine.name}
            onChange={(e) => onChange((r) => ({ ...r, name: e.target.value }))}
          />
        </label>
        <label className="form-label">
          Descripción
          <input
            maxLength={90}
            value={routine.subtitle}
            onChange={(e) => onChange((r) => ({ ...r, subtitle: e.target.value }))}
          />
        </label>
        {!routine.isRest && (
          <>
            <label className="form-label form-label-inline">
              <input
                type="checkbox"
                checked={!!routine.isFlexible}
                onChange={(e) => onChange((r) => ({ ...r, isFlexible: e.target.checked }))}
              />{' '}
              Sugerencias de ejercicios en este día
            </label>
            <div className="edit-exercises">
              <span className="section-label">EJERCICIOS DE LA RUTINA</span>
              {routine.exercises.map((rx, index) => (
                <div className="edit-row" key={`${rx.exerciseId}-${index}`}>
                  <strong>{getExercise(rx.exerciseId)?.name}</strong>
                  <div>
                    <label>
                      Series
                      <input
                        aria-label="Series objetivo"
                        type="number"
                        min="1"
                        max="10"
                        value={rx.targetSets}
                        onChange={(e) =>
                          patchExercise(index, () => ({
                            targetSets: clamp(Number(e.target.value) || 1, 1, 10),
                          }))
                        }
                      />
                    </label>
                    <label>
                      Reps mín.
                      <input
                        aria-label="Repeticiones mínimas"
                        type="number"
                        min="1"
                        max="100"
                        value={rx.minReps}
                        onChange={(e) =>
                          patchExercise(index, (item) => ({
                            minReps: clamp(Number(e.target.value) || 1, 1, item.maxReps),
                          }))
                        }
                      />
                    </label>
                    <label>
                      Reps máx.
                      <input
                        aria-label="Repeticiones máximas"
                        type="number"
                        min="1"
                        max="100"
                        value={rx.maxReps}
                        onChange={(e) =>
                          patchExercise(index, (item) => ({
                            maxReps: clamp(Number(e.target.value) || 1, item.minReps, 100),
                          }))
                        }
                      />
                    </label>
                    <label>
                      Descanso (s)
                      <input
                        aria-label="Segundos de descanso"
                        type="number"
                        min="0"
                        max="600"
                        value={rx.restSeconds}
                        onChange={(e) =>
                          patchExercise(index, () => ({
                            restSeconds: clamp(Number(e.target.value) || 0, 0, 600),
                          }))
                        }
                      />
                    </label>
                    <button
                      aria-label="Quitar ejercicio"
                      onClick={() =>
                        onChange((r) => ({ ...r, exercises: r.exercises.filter((_, i) => i !== index) }))
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <label className="form-label">
              Añadir ejercicio
              <select
                value=""
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) onChange((r) => ({ ...r, exercises: [...r.exercises, makeRx(id)] }));
                }}
              >
                <option value="">Seleccionar del catálogo...</option>
                {catalog
                  .filter((exercise) => !routine.exercises.some((rx) => rx.exerciseId === exercise.id))
                  .map((exercise) => (
                    <option value={exercise.id} key={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
              </select>
            </label>
          </>
        )}
        <button className="lime-btn modal-ok" onClick={onClose}>
          Listo <Check size={17} />
        </button>
      </div>
    </div>
  );
}
