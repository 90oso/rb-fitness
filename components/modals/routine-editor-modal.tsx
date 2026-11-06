'use client';
import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Dumbbell, Plus, Sparkles, Trash2, X } from 'lucide-react';
import ExercisePicker from './exercise-picker';
import Stepper from '@/components/ui/stepper';
import { ExerciseThumb } from '@/components/ui/exercise-media';
import { getExercise } from '@/lib/catalog';
import { makeRx } from '@/lib/format';
import type { Routine, RoutineExercise } from '@/lib/types';

/**
 * Routine editor as a sheet: edits a draft and only writes on "Guardar". One card per exercise with
 * steppers (no free-typed numbers), reorder and remove; exercises are added from a searchable picker.
 */
export default function RoutineEditorModal({
  routine,
  onSave,
  onClose,
}: {
  routine: Routine;
  onSave: (routine: Routine) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Routine>(() => structuredClone(routine));
  const [picking, setPicking] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(routine);

  const patch = (index: number, changes: Partial<RoutineExercise>) =>
    setDraft((d) => ({
      ...d,
      exercises: d.exercises.map((rx, i) => (i === index ? { ...rx, ...changes } : rx)),
    }));
  const move = (index: number, direction: -1 | 1) =>
    setDraft((d) => {
      const target = index + direction;
      if (target < 0 || target >= d.exercises.length) return d;
      const exercises = [...d.exercises];
      [exercises[index], exercises[target]] = [exercises[target], exercises[index]];
      return { ...d, exercises };
    });
  const remove = (index: number) =>
    setDraft((d) => ({ ...d, exercises: d.exercises.filter((_, i) => i !== index) }));

  function save() {
    onSave({ ...draft, name: draft.name.trim() || routine.name });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal editor-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        {picking ? (
          <ExercisePicker
            excluded={draft.exercises.map((rx) => rx.exerciseId)}
            onAdd={(id) => setDraft((d) => ({ ...d, exercises: [...d.exercises, makeRx(id)] }))}
            onClose={() => setPicking(false)}
          />
        ) : (
          <>
            <div className="editor-head">
              <div>
                <span className="overline">{draft.isRest ? 'DÍA DE DESCANSO' : 'RUTINA'}</span>
                <h2 id="edit-title">{draft.name.trim() || 'Nueva rutina'}</h2>
              </div>
              <button type="button" className="icon-action" onClick={onClose} aria-label="Cerrar sin guardar">
                <X size={20} />
              </button>
            </div>

            <div className="editor-body">
              <label className="form-label">
                Nombre
                <input
                  maxLength={65}
                  value={draft.name}
                  placeholder="Pecho y tríceps"
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </label>
              <label className="form-label">
                Descripción
                <input
                  maxLength={90}
                  value={draft.subtitle}
                  placeholder="Día 1 · Empuje"
                  onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
                />
              </label>

              {!draft.isRest && (
                <>
                  <label className="switch-row">
                    <span>
                      <strong>
                        <Sparkles size={14} /> Día flexible
                      </strong>
                      <small>RB sugiere qué entrenar según tu semana.</small>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={!!draft.isFlexible}
                      onChange={(e) => setDraft((d) => ({ ...d, isFlexible: e.target.checked }))}
                    />
                  </label>

                  <div className="section-heading editor-exercises-head">
                    <span className="section-label">EJERCICIOS · {draft.exercises.length}</span>
                    <button type="button" className="text-link" onClick={() => setPicking(true)}>
                      <Plus size={15} /> Añadir
                    </button>
                  </div>

                  {draft.exercises.length === 0 && (
                    <button type="button" className="editor-empty" onClick={() => setPicking(true)}>
                      <span>
                        <Dumbbell size={22} />
                      </span>
                      <strong>Sin ejercicios todavía</strong>
                      <small>Toca para elegirlos del catálogo.</small>
                    </button>
                  )}

                  {draft.exercises.map((rx, index) => {
                    const exercise = getExercise(rx.exerciseId);
                    return (
                      <article className="ex-card" key={`${rx.exerciseId}-${index}`}>
                        <div className="ex-card-top">
                          <span className="ex-ordinal">{index + 1}</span>
                          <ExerciseThumb exercise={exercise} size={44} />
                          <div className="ex-name">
                            <strong>{exercise?.name ?? rx.exerciseId}</strong>
                            {exercise && (
                              <small>
                                {exercise.muscle} · {exercise.equipment}
                              </small>
                            )}
                          </div>
                          <div className="ex-actions">
                            <button
                              type="button"
                              aria-label="Subir"
                              disabled={index === 0}
                              onClick={() => move(index, -1)}
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              type="button"
                              aria-label="Bajar"
                              disabled={index === draft.exercises.length - 1}
                              onClick={() => move(index, 1)}
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              type="button"
                              className="ex-remove"
                              aria-label="Quitar ejercicio"
                              onClick={() => remove(index)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="ex-controls">
                          <Stepper
                            label="Series"
                            value={rx.targetSets}
                            min={1}
                            max={10}
                            onChange={(v) => patch(index, { targetSets: v })}
                          />
                          <Stepper
                            label="Reps mín."
                            value={rx.minReps}
                            min={1}
                            max={rx.maxReps}
                            onChange={(v) => patch(index, { minReps: v })}
                          />
                          <Stepper
                            label="Reps máx."
                            value={rx.maxReps}
                            min={rx.minReps}
                            max={100}
                            onChange={(v) => patch(index, { maxReps: v })}
                          />
                          <Stepper
                            label="Descanso"
                            value={rx.restSeconds}
                            min={0}
                            max={600}
                            step={15}
                            format={(v) => `${v} s`}
                            onChange={(v) => patch(index, { restSeconds: v })}
                          />
                        </div>
                      </article>
                    );
                  })}
                </>
              )}
            </div>

            <div className="editor-foot">
              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="lime-btn" onClick={save} disabled={!dirty}>
                <Check size={17} /> Guardar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
