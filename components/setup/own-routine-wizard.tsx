'use client';
import { useState } from 'react';
import { ArrowRight, Check, Plus, X } from 'lucide-react';
import ExercisePickerModal from '@/components/modals/exercise-picker-modal';
import { ExercisePhoto } from '@/components/ui/exercise-media';
import { getExercise, majorMuscles } from '@/lib/catalog';
import { defaultCycleDay } from '@/lib/cycles';
import { uid } from '@/lib/metrics';
import { volumeFor, weekPattern, type DaysPerWeek } from '@/lib/planner';
import type { Experience, Muscle, Profile, Routine, RoutineExercise } from '@/lib/types';
import { ChoiceChips, DAYS, StepBlock, WeekStrip } from './steps';

interface OwnDay {
  name: string;
  muscles: Muscle[];
  exerciseIds: string[];
}

/**
 * «Ya tengo rutina»: días por semana → por cada día de entrenamiento, nombre, músculos y ejercicios del
 * catálogo (selector prefiltrado) → resumen → crear. Construye la semana de 7 días con descansos.
 */
export default function OwnRoutineWizard({
  goal,
  experience,
  onCreate,
  onOpenDetail,
  onBackToChoice,
}: {
  goal: Profile['goal'];
  experience: Experience;
  onCreate: (week: Routine[], days: DaysPerWeek) => void;
  onOpenDetail: (exerciseId: string) => void;
  onBackToChoice: () => void;
}) {
  const [days, setDays] = useState<DaysPerWeek | null>(null);
  const [list, setList] = useState<OwnDay[]>([]);
  const [current, setCurrent] = useState(0); // índice del día de entrenamiento en edición; list.length = resumen
  const [picking, setPicking] = useState(false);
  const stage: 'days' | 'day' | 'summary' = days === null ? 'days' : current < days ? 'day' : 'summary';

  const startDays = (value: DaysPerWeek) => {
    setDays(value);
    setList(
      Array.from({ length: value }, (_, i) => ({ name: `Día ${i + 1}`, muscles: [], exerciseIds: [] }))
    );
    setCurrent(0);
  };
  const patchDay = (changes: Partial<OwnDay>) =>
    setList((items) => items.map((day, i) => (i === current ? { ...day, ...changes } : day)));
  const day = list[current];

  const build = (): Routine[] => {
    if (!days) return [];
    const pattern = weekPattern(days);
    let n = 0;
    return pattern.map((trains) => {
      if (!trains)
        return {
          ...defaultCycleDay(uid(), true),
          name: 'Descanso',
          subtitle: 'Recuperación',
          tag: 'REST DAY',
        };
      const own = list[n++];
      const exercises: RoutineExercise[] = own.exerciseIds.map((exerciseId) => ({
        exerciseId,
        ...volumeFor(goal, experience, 'accessory'),
      }));
      return {
        id: uid(),
        name: own.name.trim() || `Día ${n}`,
        subtitle: own.muscles.length ? own.muscles.join(' · ') : 'Mi rutina',
        tag: (own.muscles[0] ?? 'MI RUTINA').toUpperCase(),
        exercises,
      };
    });
  };

  if (stage === 'days') {
    return (
      <StepBlock
        title="¿Cuántos días entrenas por semana?"
        hint="RB coloca los descansos en los huecos habituales."
      >
        <ChoiceChips options={DAYS} value={days} onChange={startDays} columns={3} />
        <div className="setup-actions">
          <button type="button" className="secondary-btn" onClick={onBackToChoice}>
            Atrás
          </button>
        </div>
      </StepBlock>
    );
  }

  if (stage === 'summary') {
    const week = build();
    const empty = list.filter((d) => d.exerciseIds.length === 0).length;
    return (
      <StepBlock
        title="Tu semana"
        hint={
          empty
            ? `${empty} ${empty === 1 ? 'día quedó' : 'días quedaron'} sin ejercicios; puedes completarlos después.`
            : undefined
        }
      >
        <WeekStrip week={week} />
        <ul className="own-summary">
          {list.map((d, i) => (
            <li key={i}>
              <button type="button" className="own-summary-row" onClick={() => setCurrent(i)}>
                <strong>{d.name.trim() || `Día ${i + 1}`}</strong>
                <small>
                  {d.exerciseIds.length} {d.exerciseIds.length === 1 ? 'ejercicio' : 'ejercicios'}
                  {d.muscles.length ? ` · ${d.muscles.join(', ')}` : ''}
                </small>
              </button>
            </li>
          ))}
        </ul>
        <div className="setup-actions">
          <button type="button" className="secondary-btn" onClick={() => setCurrent(list.length - 1)}>
            Atrás
          </button>
          <button type="button" className="lime-btn" onClick={() => onCreate(week, days!)}>
            <Check size={17} aria-hidden="true" /> Crear mi ciclo
          </button>
        </div>
      </StepBlock>
    );
  }

  return (
    <StepBlock title={`Día ${current + 1} de ${days}`}>
      <label className="form-label">
        Nombre del día
        <input
          value={day.name}
          maxLength={40}
          placeholder={`Día ${current + 1}`}
          onChange={(event) => patchDay({ name: event.target.value })}
        />
      </label>
      <p className="setup-label">¿Qué trabajas ese día?</p>
      <div className="setup-chips setup-chips-3 setup-chips-small" role="group" aria-label="Músculos">
        {majorMuscles.map((muscle) => {
          const on = day.muscles.includes(muscle);
          return (
            <button
              type="button"
              key={muscle}
              aria-pressed={on}
              className={`setup-chip ${on ? 'chosen' : ''}`}
              onClick={() =>
                patchDay({ muscles: on ? day.muscles.filter((m) => m !== muscle) : [...day.muscles, muscle] })
              }
            >
              <span className="setup-chip-label">{muscle}</span>
            </button>
          );
        })}
      </div>
      <p className="setup-label">Ejercicios</p>
      {day.exerciseIds.length > 0 && (
        <ul className="own-exercises">
          {day.exerciseIds.map((id) => {
            const exercise = getExercise(id);
            return (
              <li key={id}>
                <ExercisePhoto exercise={exercise} width={60} height={40} />
                <strong>{exercise?.name ?? id}</strong>
                <button
                  type="button"
                  className="icon-action"
                  aria-label={`Quitar ${exercise?.name ?? id}`}
                  onClick={() => patchDay({ exerciseIds: day.exerciseIds.filter((x) => x !== id) })}
                >
                  <X size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button type="button" className="exercise-add" onClick={() => setPicking(true)}>
        <Plus size={17} aria-hidden="true" />{' '}
        {day.exerciseIds.length ? 'Añadir más ejercicios' : 'Elegir ejercicios'}
      </button>
      <div className="setup-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={() => (current === 0 ? setDays(null) : setCurrent(current - 1))}
        >
          Atrás
        </button>
        <button type="button" className="lime-btn" onClick={() => setCurrent(current + 1)}>
          {current + 1 < days! ? 'Siguiente día' : 'Ver resumen'} <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
      {picking && (
        <ExercisePickerModal
          title={`Ejercicios · ${day.name.trim() || `Día ${current + 1}`}`}
          excluded={day.exerciseIds}
          preset={day.muscles}
          onConfirm={(ids) => patchDay({ exerciseIds: [...day.exerciseIds, ...ids] })}
          onClose={() => setPicking(false)}
          onOpenDetail={onOpenDetail}
        />
      )}
    </StepBlock>
  );
}
