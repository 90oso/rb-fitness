'use client';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Minus,
  Plus,
  Sparkles,
  Timer,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { ExerciseThumb } from '@/components/ui/exercise-media';
import { getExercise } from '@/lib/catalog';
import { prettyDuration, type progressionAdvice } from '@/lib/metrics';
import type { ActiveWorkout, Exercise, Routine, RoutineExercise, SetEntry } from '@/lib/types';

export default function ActiveSessionView({
  active,
  routine,
  now,
  selectedExercise,
  currentExercise,
  currentRx,
  previousSet,
  progression,
  weight,
  reps,
  unit,
  restRemainingMs,
  showUnit,
  onSelectExercise,
  onWeightChange,
  onRepsChange,
  onSaveSet,
  onDeleteSet,
  onSkipRest,
  onFinish,
  onDiscard,
  onOpenGuide,
}: {
  active: ActiveWorkout;
  routine: Routine | undefined;
  now: number;
  selectedExercise: string;
  currentExercise: Exercise | undefined;
  currentRx: RoutineExercise | undefined;
  previousSet: SetEntry | undefined;
  progression: ReturnType<typeof progressionAdvice>;
  weight: number;
  reps: number;
  unit: 'kg' | 'lb';
  restRemainingMs: number | null;
  showUnit: (kg: number) => string;
  onSelectExercise: (exerciseId: string) => void;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onSaveSet: () => void;
  onDeleteSet: (setId: string) => void;
  onSkipRest: () => void;
  onFinish: () => void;
  onDiscard: () => void;
  onOpenGuide: (exerciseId: string) => void;
}) {
  const setsForCurrent = active.sets.filter((set) => set.exerciseId === selectedExercise);
  const weightStep = unit === 'kg' ? 2.5 : 5;
  const elapsedMinutes = Math.floor((now - new Date(active.startedAt).getTime()) / 60000);

  return (
    <>
      <div className="session-header">
        <div>
          <span className="overline session-status">
            <span className="blip" /> SESIÓN EN CURSO
          </span>
          <h1>{routine?.name}</h1>
          <p>
            <Clock3 size={15} /> {elapsedMinutes} min transcurridos <span>·</span> {active.sets.length} series
            registradas
          </p>
        </div>
        <button
          className="icon-action"
          onClick={onDiscard}
          title="Descartar sesión"
          aria-label="Descartar sesión"
        >
          <X size={22} />
        </button>
      </div>

      <div className="active-layout">
        <section className="card current-exercise">
          <div className="card-top">
            <span className="section-label">EJERCICIO ACTUAL</span>
            <span className="routine-tag">{routine?.tag}</span>
          </div>
          <div className="exercise-choices">
            {routine?.exercises.map((rx, index) => (
              <button
                key={rx.exerciseId}
                onClick={() => onSelectExercise(rx.exerciseId)}
                className={`exercise-choice ${selectedExercise === rx.exerciseId ? 'active' : ''}`}
              >
                <span>{index + 1}</span>
                <span>{getExercise(rx.exerciseId)?.name}</span>
                <strong>
                  {active.sets.filter((set) => set.exerciseId === rx.exerciseId).length}/{rx.targetSets}
                </strong>
              </button>
            ))}
          </div>
        </section>

        <section className="card log-card">
          <div className="card-top">
            <span className="section-label">
              <Dumbbell size={15} /> REGISTRAR SERIE
            </span>
            <span className="today-chip">SERIE {setsForCurrent.length + 1}</span>
          </div>
          <div className="log-exercise">
            <ExerciseThumb exercise={currentExercise} size={64} />
            <div>
              <h2>{currentExercise?.name || 'Elige un ejercicio'}</h2>
              <p>
                {currentExercise?.muscle} · {currentExercise?.equipment} · Objetivo {currentRx?.targetSets} ×{' '}
                {currentRx?.minReps}–{currentRx?.maxReps}
              </p>
              {currentExercise && (
                <button
                  type="button"
                  className="text-link log-guide"
                  onClick={() => onOpenGuide(currentExercise.id)}
                >
                  Ver cómo se hace <BookOpen size={14} />
                </button>
              )}
            </div>
          </div>

          {previousSet && (
            <div className="previous-result">
              <TrendingUp size={17} />
              <span>
                Última vez:{' '}
                <strong>
                  {showUnit(previousSet.weight)} × {previousSet.reps} reps
                </strong>
              </span>
            </div>
          )}

          {progression && (
            <div className="progression-hint">
              <Sparkles size={17} />
              <span>
                {progression.kind === 'increase'
                  ? `Completaste tus series objetivo. Si la técnica fue buena y la máquina lo permite, considera probar ${showUnit(progression.proposedWeightKg)}.`
                  : `Objetivo para hoy: consolida tus series hasta completar ${currentRx?.targetSets} × ${currentRx?.maxReps} con buena técnica.`}
              </span>
            </div>
          )}

          <div className="numbers-row">
            <div className="number-control">
              <span>PESO ({unit.toUpperCase()})</span>
              <div>
                <button
                  aria-label="Disminuir peso"
                  onClick={() => onWeightChange(Math.max(0, Number((weight - weightStep).toFixed(1))))}
                >
                  <Minus size={19} />
                </button>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  inputMode="decimal"
                  value={weight}
                  onChange={(event) => onWeightChange(Number(event.target.value))}
                  aria-label={`Peso en ${unit}`}
                />
                <button
                  aria-label="Aumentar peso"
                  onClick={() => onWeightChange(Number((weight + weightStep).toFixed(1)))}
                >
                  <Plus size={19} />
                </button>
              </div>
            </div>
            <div className="number-control">
              <span>REPETICIONES</span>
              <div>
                <button
                  aria-label="Disminuir repeticiones"
                  onClick={() => onRepsChange(Math.max(1, reps - 1))}
                >
                  <Minus size={19} />
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  inputMode="numeric"
                  value={reps}
                  onChange={(event) => onRepsChange(Number(event.target.value))}
                  aria-label="Repeticiones"
                />
                <button
                  aria-label="Aumentar repeticiones"
                  onClick={() => onRepsChange(Math.min(100, reps + 1))}
                >
                  <Plus size={19} />
                </button>
              </div>
            </div>
          </div>

          <button className="save-set" onClick={onSaveSet}>
            <Plus size={20} /> Guardar serie <Check size={19} />
          </button>

          <div className="logged-sets">
            <span className="section-label">SERIES DE ESTE EJERCICIO</span>
            {setsForCurrent.length === 0 ? (
              <p className="muted">Aún no has registrado ninguna serie.</p>
            ) : (
              setsForCurrent.map((set, index) => (
                <div className="logged-set" key={set.id}>
                  <span className="set-index">{index + 1}</span>
                  <strong>
                    {showUnit(set.weight)} <span>×</span> {set.reps}
                  </strong>
                  <CheckCircle2 size={17} className="lime-text" />
                  <button aria-label="Eliminar serie" onClick={() => onDeleteSet(set.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          {restRemainingMs !== null && (
            <div className="rest-timer">
              <Timer size={19} />
              <span>Descanso</span>
              <strong>{prettyDuration(restRemainingMs / 1000)}</strong>
              <button onClick={onSkipRest}>Omitir</button>
            </div>
          )}

          <button className="finish-btn" onClick={onFinish}>
            <CheckCircle2 size={19} /> Finalizar entrenamiento
          </button>
        </section>
      </div>
    </>
  );
}
