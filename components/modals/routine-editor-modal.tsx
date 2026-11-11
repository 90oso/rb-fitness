'use client';
import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BookOpen, Check, Dumbbell, GripVertical, Plus, Sparkles, Trash2, X } from 'lucide-react';
import ExercisePicker from './exercise-picker';
import Stepper from '@/components/ui/stepper';
import { ExercisePhoto } from '@/components/ui/exercise-media';
import { getExercise } from '@/lib/catalog';
import { makeRx } from '@/lib/format';
import type { Routine, RoutineExercise } from '@/lib/types';

/** «3 × 8–12 · 90 s»: lo que se ve en la fila cerrada. */
const summary = (rx: RoutineExercise) =>
  `${rx.targetSets} × ${rx.minReps}–${rx.maxReps} · ${rx.restSeconds} s`;

/**
 * Routine editor as a sheet: edits a draft and only writes on "Guardar". One compact row per exercise that
 * expands (one at a time) to the steppers; drag the handle to reorder; exercises come from the picker.
 */
export default function RoutineEditorModal({
  routine,
  onSave,
  onClose,
  onOpenDetail,
}: {
  routine: Routine;
  onSave: (routine: Routine) => void;
  onClose: () => void;
  onOpenDetail: (exerciseId: string) => void;
}) {
  const [draft, setDraft] = useState<Routine>(() => structuredClone(routine));
  const [picking, setPicking] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(routine);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const patch = (exerciseId: string, changes: Partial<RoutineExercise>) =>
    setDraft((d) => ({
      ...d,
      exercises: d.exercises.map((rx) => (rx.exerciseId === exerciseId ? { ...rx, ...changes } : rx)),
    }));
  const remove = (exerciseId: string) =>
    setDraft((d) => ({ ...d, exercises: d.exercises.filter((rx) => rx.exerciseId !== exerciseId) }));
  const add = (ids: string[]) => setDraft((d) => ({ ...d, exercises: [...d.exercises, ...ids.map(makeRx)] }));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setDraft((d) => {
      const from = d.exercises.findIndex((rx) => rx.exerciseId === active.id);
      const to = d.exercises.findIndex((rx) => rx.exerciseId === over.id);
      return from < 0 || to < 0 ? d : { ...d, exercises: arrayMove(d.exercises, from, to) };
    });
  };

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
            subtitle={draft.name.trim() || 'Nueva rutina'}
            onConfirm={(ids) => {
              add(ids);
              setPicking(false);
            }}
            onClose={() => setPicking(false)}
            onOpenDetail={onOpenDetail}
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

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={onDragEnd}
                  >
                    <SortableContext
                      items={draft.exercises.map((rx) => rx.exerciseId)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ol className="ex-list">
                        {draft.exercises.map((rx, index) => (
                          <ExerciseRow
                            key={rx.exerciseId}
                            rx={rx}
                            index={index}
                            open={openId === rx.exerciseId}
                            onToggle={() => setOpenId((id) => (id === rx.exerciseId ? null : rx.exerciseId))}
                            onPatch={(changes) => patch(rx.exerciseId, changes)}
                            onRemove={() => remove(rx.exerciseId)}
                            onOpenDetail={() => onOpenDetail(rx.exerciseId)}
                          />
                        ))}
                      </ol>
                    </SortableContext>
                  </DndContext>
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

function ExerciseRow({
  rx,
  index,
  open,
  onToggle,
  onPatch,
  onRemove,
  onOpenDetail,
}: {
  rx: RoutineExercise;
  index: number;
  open: boolean;
  onToggle: () => void;
  onPatch: (changes: Partial<RoutineExercise>) => void;
  onRemove: () => void;
  onOpenDetail: () => void;
}) {
  const exercise = getExercise(rx.exerciseId);
  const name = exercise?.name ?? rx.exerciseId;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: rx.exerciseId });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const controlsId = `ex-controls-${rx.exerciseId}`;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`ex-row ${open ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="ex-row-top">
        <button
          type="button"
          className="ex-row-main"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={controlsId}
        >
          <span className="ex-ordinal">{index + 1}</span>
          <ExercisePhoto exercise={exercise} width={84} height={56} />
          <span className="ex-name">
            <strong>{name}</strong>
            <small className="ex-summary">{summary(rx)}</small>
          </span>
        </button>
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="ex-handle"
          aria-label={`Mover ${name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </button>
      </div>
      {open && (
        <div className="ex-row-body" id={controlsId}>
          <div className="ex-controls">
            <Stepper
              label="Series"
              value={rx.targetSets}
              min={1}
              max={10}
              onChange={(v) => onPatch({ targetSets: v })}
            />
            <Stepper
              label="Descanso"
              value={rx.restSeconds}
              min={0}
              max={600}
              step={15}
              format={(v) => `${v} s`}
              onChange={(v) => onPatch({ restSeconds: v })}
            />
            <Stepper
              label="Reps mín."
              value={rx.minReps}
              min={1}
              max={rx.maxReps}
              onChange={(v) => onPatch({ minReps: v })}
            />
            <Stepper
              label="Reps máx."
              value={rx.maxReps}
              min={rx.minReps}
              max={100}
              onChange={(v) => onPatch({ maxReps: v })}
            />
          </div>
          <div className="ex-row-actions">
            {exercise && (
              <button type="button" className="text-link" onClick={onOpenDetail}>
                <BookOpen size={14} /> Ver cómo se hace
              </button>
            )}
            <button
              type="button"
              className="text-link ex-remove"
              onClick={onRemove}
              aria-label={`Quitar ${name}`}
            >
              <Trash2 size={14} /> Quitar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
