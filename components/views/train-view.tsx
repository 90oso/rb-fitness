'use client';
import {
  Check,
  ChevronRight,
  Copy,
  Dumbbell,
  MoveDown,
  MoveUp,
  Pencil,
  Play,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Waves,
} from 'lucide-react';
import { PageHead } from '@/components/ui/bits';
import { getExercise } from '@/lib/catalog';
import type { suggestions } from '@/lib/metrics';
import type { AppData, Routine } from '@/lib/types';

export default function TrainView({
  data,
  nextRoutine,
  suggestionList,
  showCycleManager,
  cycleError,
  onToggleCycleManager,
  onAddDay,
  onMoveDay,
  onDuplicateDay,
  onRemoveDay,
  onEditRoutine,
  onStart,
  onMarkRest,
  onApplyFlexible,
}: {
  data: AppData;
  nextRoutine: Routine;
  suggestionList: ReturnType<typeof suggestions>;
  showCycleManager: boolean;
  cycleError: string;
  onToggleCycleManager: () => void;
  onAddDay: (isRest: boolean) => void;
  onMoveDay: (routineId: string, direction: -1 | 1) => void;
  onDuplicateDay: (routineId: string) => void;
  onRemoveDay: (routineId: string) => void;
  onEditRoutine: (routineId: string) => void;
  onStart: (routineId: string) => void;
  onMarkRest: () => void;
  onApplyFlexible: (exerciseIds: string[]) => void;
}) {
  const routines = data.routines;
  return (
    <>
      <PageHead
        overline="TU PLAN PERSONAL"
        title="Entrena a tu manera."
        sub="Sigue tu ciclo o elige una rutina. Puedes modificar cada ejercicio y sus objetivos."
      />

      {nextRoutine.isRest && (
        <div className="card rest-banner">
          <Waves size={25} />
          <div>
            <strong>Tu siguiente etapa es descanso</strong>
            <p>El ciclo incluye recuperación. No se contabiliza como entrenamiento.</p>
          </div>
          <button className="small-primary" onClick={onMarkRest}>
            Marcar descanso <Check size={17} />
          </button>
        </div>
      )}

      <div className="cycle-toolbar">
        <div>
          <strong>Diseña tu propio ciclo</strong>
          <p>
            Crea tantos días de entrenamiento o descanso como necesites, sin depender de una plantilla fija.
          </p>
        </div>
        <div>
          <button className="secondary-btn" onClick={onToggleCycleManager}>
            <Settings2 size={16} /> Organizar ciclo
          </button>
          <button className="lime-btn" onClick={() => onAddDay(false)}>
            <Plus size={16} /> Nuevo día
          </button>
        </div>
      </div>

      {showCycleManager && (
        <section className="card cycle-manager">
          <div className="section-heading">
            <div>
              <span className="overline">ORDEN FLEXIBLE</span>
              <h2>Tu ciclo personalizado</h2>
            </div>
          </div>
          {cycleError && (
            <p className="gate-error" role="alert">
              {cycleError}
            </p>
          )}
          {routines.map((routine, index) => (
            <div className="cycle-management-row" key={routine.id}>
              <span className="cycle-number">{index + 1}</span>
              <div className="cycle-manage-label">
                <strong>{routine.name}</strong>
                <small>
                  {routine.isRest
                    ? 'Descanso'
                    : routine.isFlexible
                      ? `Flexible · ${routine.exercises.length} ejercicios`
                      : `${routine.exercises.length} ejercicios`}
                </small>
              </div>
              <div className="cycle-controls">
                <button
                  aria-label="Mover arriba"
                  disabled={index === 0}
                  onClick={() => onMoveDay(routine.id, -1)}
                >
                  <MoveUp size={17} />
                </button>
                <button
                  aria-label="Mover abajo"
                  disabled={index === routines.length - 1}
                  onClick={() => onMoveDay(routine.id, 1)}
                >
                  <MoveDown size={17} />
                </button>
                <button aria-label="Editar día" onClick={() => onEditRoutine(routine.id)}>
                  <Pencil size={17} />
                </button>
                <button aria-label="Duplicar día" onClick={() => onDuplicateDay(routine.id)}>
                  <Copy size={17} />
                </button>
                <button
                  aria-label="Eliminar día"
                  onClick={() => onRemoveDay(routine.id)}
                  disabled={routines.length <= 1 || data.active?.routineId === routine.id}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
          <div className="cycle-add">
            <button className="secondary-btn" onClick={() => onAddDay(false)}>
              <Plus size={16} /> Añadir entrenamiento
            </button>
            <button className="secondary-btn" onClick={() => onAddDay(true)}>
              <Waves size={16} /> Añadir descanso
            </button>
          </div>
          <p className="muted">Reordenar o eliminar días no borra el historial de sesiones anteriores.</p>
        </section>
      )}

      <div className="routine-grid">
        {routines
          .filter((routine) => !routine.isRest)
          .map((routine, index) => (
            <div className="card routine-tile" key={routine.id}>
              <div className="routine-top">
                <span className="routine-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="routine-tag">{routine.tag}</span>
              </div>
              <div className="routine-glyph">
                <Dumbbell size={28} />
              </div>
              <h2>{routine.name}</h2>
              <p>
                {routine.subtitle} · {routine.exercises.length} ejercicios
              </p>
              <div className="routine-previews">
                {routine.exercises.slice(0, 2).map((rx) => (
                  <span key={rx.exerciseId}>{getExercise(rx.exerciseId)?.name}</span>
                ))}
                {routine.exercises.length > 2 && <span>+ {routine.exercises.length - 2} más</span>}
              </div>
              <div className="routine-actions">
                <button className="secondary-btn" onClick={() => onEditRoutine(routine.id)}>
                  <Pencil size={16} /> Editar
                </button>
                <button className="lime-btn" onClick={() => onStart(routine.id)}>
                  <Play size={16} /> Empezar
                </button>
              </div>
            </div>
          ))}
      </div>

      {!nextRoutine.isRest && nextRoutine.isFlexible && (
        <div className="card suggestion-block">
          <div className="section-heading">
            <div>
              <span className="overline">RB TE SUGIERE</span>
              <h2>Sugerencias para este día</h2>
            </div>
            <Sparkles size={24} className="lime-text" />
          </div>
          <p>
            Ordenado por menor número de series registradas esta semana en cada grupo de músculos. Tú eliges.
          </p>
          <div className="suggestions">
            {suggestionList.map((suggestion, index) => (
              <div key={suggestion.id} className="suggestion">
                <span className="suggestion-num">{index + 1}</span>
                <div>
                  <strong>{suggestion.label}</strong>
                  <small>
                    {suggestion.details} · {suggestion.score} series recientes
                  </small>
                </div>
                <button onClick={() => onApplyFlexible(suggestion.exercises)}>
                  Elegir <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
