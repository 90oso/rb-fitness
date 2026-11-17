'use client';
import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, Clock3, Dumbbell, HeartPulse, Sparkles, Target } from 'lucide-react';
import { ExercisePhoto } from '@/components/ui/exercise-media';
import { getExercise } from '@/lib/catalog';
import {
  DAY_LETTERS,
  estimateMinutes,
  type DaysPerWeek,
  type PlannerInput,
  type Proposal,
} from '@/lib/planner';
import type { Experience, GymKit, Limitation, Profile, Routine, SessionMinutes } from '@/lib/types';

/* ------------------------------------------------------------------------------------------------
 * Piezas compartidas por los pasos: textos de las opciones, chips de una o varias elecciones,
 * tira de la semana y vista previa de una semana.
 * ---------------------------------------------------------------------------------------------- */

export const GOALS: { value: Profile['goal']; label: string; hint: string }[] = [
  { value: 'muscle', label: 'Ganar músculo', hint: 'Más volumen y repeticiones medias' },
  { value: 'strength', label: 'Ganar fuerza', hint: 'Más peso, menos repeticiones, más descanso' },
  { value: 'loss', label: 'Perder grasa', hint: 'Sesiones densas y descansos cortos' },
  { value: 'maintenance', label: 'Mantenerme', hint: 'Lo justo para sostener lo que tienes' },
];
export const EXPERIENCES: { value: Experience; label: string; hint: string }[] = [
  { value: 'beginner', label: 'Principiante', hint: 'Menos de 6 meses entrenando' },
  { value: 'intermediate', label: 'Intermedio', hint: 'Entre 6 meses y 2 años' },
  { value: 'advanced', label: 'Avanzado', hint: 'Más de 2 años seguidos' },
];
export const DAYS: { value: DaysPerWeek; label: string }[] = [2, 3, 4, 5, 6].map((value) => ({
  value: value as DaysPerWeek,
  label: `${value} días`,
}));
export const MINUTES: { value: SessionMinutes; label: string }[] = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 75, label: '75 min o más' },
];
export const KITS: { value: GymKit; label: string; hint: string }[] = [
  { value: 'machines', label: 'Máquinas y poleas', hint: 'Lo habitual en gimnasios tipo Planet Fitness' },
  { value: 'full', label: 'También mancuernas y barras', hint: 'Gimnasio completo' },
  { value: 'dumbbells', label: 'Solo mancuernas y peso corporal', hint: 'En casa o con poco equipo' },
];
export const LIMITATIONS: { value: Limitation; label: string }[] = [
  { value: 'knees', label: 'Rodillas' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'lowerBack', label: 'Espalda baja' },
  { value: 'wrists', label: 'Muñecas y codos' },
];
export const STEP_ICON = {
  goal: Target,
  experience: Sparkles,
  days: Clock3,
  kit: Dumbbell,
  limitations: HeartPulse,
};

/** Chips grandes de una elección. */
export function ChoiceChips<T extends string | number>({
  options,
  value,
  onChange,
  columns = 1,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div className={`setup-chips setup-chips-${columns}`} role="radiogroup">
      {options.map((option) => (
        <button
          type="button"
          key={String(option.value)}
          role="radio"
          aria-checked={value === option.value}
          className={`setup-chip ${value === option.value ? 'chosen' : ''}`}
          onClick={() => onChange(option.value)}
        >
          <span className="setup-chip-label">{option.label}</span>
          {option.hint && <small>{option.hint}</small>}
          {value === option.value && <Check size={16} aria-hidden="true" className="setup-chip-check" />}
        </button>
      ))}
    </div>
  );
}

/** Chips de varias elecciones con una opción «Ninguna» excluyente. */
export function MultiChips<T extends string>({
  options,
  value,
  onChange,
  noneLabel,
}: {
  options: { value: T; label: string }[];
  value: T[];
  onChange: (value: T[]) => void;
  noneLabel: string;
}) {
  const toggle = (item: T) =>
    onChange(value.includes(item) ? value.filter((v) => v !== item) : [...value, item]);
  return (
    <div className="setup-chips setup-chips-2" role="group">
      <button
        type="button"
        aria-pressed={value.length === 0}
        className={`setup-chip ${value.length === 0 ? 'chosen' : ''}`}
        onClick={() => onChange([])}
      >
        <span className="setup-chip-label">{noneLabel}</span>
        {value.length === 0 && <Check size={16} aria-hidden="true" className="setup-chip-check" />}
      </button>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={value.includes(option.value)}
          className={`setup-chip ${value.includes(option.value) ? 'chosen' : ''}`}
          onClick={() => toggle(option.value)}
        >
          <span className="setup-chip-label">{option.label}</span>
          {value.includes(option.value) && (
            <Check size={16} aria-hidden="true" className="setup-chip-check" />
          )}
        </button>
      ))}
    </div>
  );
}

const shortTag = (routine: Routine) =>
  routine.isRest ? '·' : routine.tag === 'FULL BODY' ? 'FULL' : routine.tag.replace(' DAY', '').slice(0, 6);

/** Semana en miniatura: L M X J V S D con la etiqueta corta de cada día. */
export function WeekStrip({ week, active }: { week: Routine[]; active?: number }) {
  return (
    <ol className="week-strip" aria-label="Semana">
      {week.map((routine, i) => (
        <li
          key={routine.id}
          className={`${routine.isRest ? 'rest' : 'train'} ${active === i ? 'active' : ''}`}
          aria-label={`${DAY_LETTERS[i]}: ${routine.isRest ? 'descanso' : routine.name}`}
        >
          <span>{DAY_LETTERS[i]}</span>
          <strong>{shortTag(routine)}</strong>
        </li>
      ))}
    </ol>
  );
}

/** Los 7 días con sus ejercicios en filas compactas. */
export function WeekPreview({ week, onOpenDetail }: { week: Routine[]; onOpenDetail: (id: string) => void }) {
  return (
    <div className="week-preview">
      {week.map((routine, i) =>
        routine.isRest ? (
          <div className="week-day week-day-rest" key={routine.id}>
            <span className="week-day-letter">{DAY_LETTERS[i]}</span>
            <strong>Descanso</strong>
          </div>
        ) : (
          <section className="week-day" key={routine.id} aria-labelledby={`wd-${routine.id}`}>
            <header>
              <span className="week-day-letter">{DAY_LETTERS[i]}</span>
              <div>
                <strong id={`wd-${routine.id}`}>{routine.name}</strong>
                <small>
                  {routine.exercises.length} ejercicios · ≈ {estimateMinutes(routine)} min
                </small>
              </div>
            </header>
            <ul>
              {routine.exercises.map((rx) => {
                const exercise = getExercise(rx.exerciseId);
                return (
                  <li key={rx.exerciseId}>
                    <button
                      type="button"
                      className="week-ex-photo"
                      onClick={() => onOpenDetail(rx.exerciseId)}
                      aria-label={`Ver cómo se hace ${exercise?.name ?? rx.exerciseId}`}
                    >
                      <ExercisePhoto exercise={exercise} width={60} height={40} />
                    </button>
                    <span>
                      <strong>{exercise?.name ?? rx.exerciseId}</strong>
                      <small>
                        {rx.targetSets} × {rx.minReps}–{rx.maxReps} · {rx.restSeconds} s
                      </small>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )
      )}
    </div>
  );
}

/** Tarjeta de una propuesta. */
export function ProposalCard({ proposal, onOpen }: { proposal: Proposal; onOpen: () => void }) {
  return (
    <button type="button" className="proposal-card" onClick={onOpen}>
      <span className="proposal-head">
        <strong>{proposal.title}</strong>
        <ArrowRight size={18} aria-hidden="true" />
      </span>
      <small className="proposal-why">{proposal.why}</small>
      <WeekStrip week={proposal.week} />
      <small className="proposal-minutes">≈ {proposal.minutes} min por sesión</small>
    </button>
  );
}

/** Cuestionario: seis preguntas, una por pantalla. Devuelve la entrada del motor cuando está completa. */
export type QuizKey = 'goal' | 'experience' | 'days' | 'minutes' | 'kit' | 'limitations';
export const QUIZ_ORDER: QuizKey[] = ['goal', 'experience', 'days', 'minutes', 'kit', 'limitations'];
export interface QuizState {
  goal: Profile['goal'] | null;
  experience: Experience | null;
  days: DaysPerWeek | null;
  minutes: SessionMinutes | null;
  kit: GymKit | null;
  limitations: Limitation[];
}
export function quizFromProfile(profile: Profile): QuizState {
  const days = [2, 3, 4, 5, 6].includes(profile.daysPerWeek) ? (profile.daysPerWeek as DaysPerWeek) : null;
  return {
    goal: profile.goal,
    experience: profile.experience ?? null,
    days,
    minutes: profile.sessionMinutes ?? null,
    kit: profile.kit ?? null,
    limitations: profile.limitations ?? [],
  };
}
export function quizToInput(quiz: QuizState): PlannerInput | null {
  if (!quiz.goal || !quiz.experience || !quiz.days || !quiz.minutes || !quiz.kit) return null;
  return {
    goal: quiz.goal,
    experience: quiz.experience,
    daysPerWeek: quiz.days,
    sessionMinutes: quiz.minutes,
    kit: quiz.kit,
    limitations: quiz.limitations,
  };
}

export function QuizStep({
  step,
  quiz,
  onChange,
}: {
  step: QuizKey;
  quiz: QuizState;
  onChange: (next: QuizState) => void;
}) {
  switch (step) {
    case 'goal':
      return (
        <StepBlock title="¿Cuál es tu objetivo?">
          <ChoiceChips options={GOALS} value={quiz.goal} onChange={(goal) => onChange({ ...quiz, goal })} />
        </StepBlock>
      );
    case 'experience':
      return (
        <StepBlock title="¿Cuánto llevas entrenando?">
          <ChoiceChips
            options={EXPERIENCES}
            value={quiz.experience}
            onChange={(experience) => onChange({ ...quiz, experience })}
          />
        </StepBlock>
      );
    case 'days':
      return (
        <StepBlock title="¿Cuántos días por semana puedes entrenar?">
          <ChoiceChips
            options={DAYS}
            value={quiz.days}
            onChange={(days) => onChange({ ...quiz, days })}
            columns={3}
          />
        </StepBlock>
      );
    case 'minutes':
      return (
        <StepBlock title="¿Cuánto tiempo tienes por sesión?">
          <ChoiceChips
            options={MINUTES}
            value={quiz.minutes}
            onChange={(minutes) => onChange({ ...quiz, minutes })}
            columns={2}
          />
        </StepBlock>
      );
    case 'kit':
      return (
        <StepBlock title="¿Con qué equipo entrenas?">
          <ChoiceChips options={KITS} value={quiz.kit} onChange={(kit) => onChange({ ...quiz, kit })} />
        </StepBlock>
      );
    case 'limitations':
      return (
        <StepBlock
          title="¿Alguna zona que cuidar?"
          hint="Opcional. Evitamos los ejercicios que más la cargan."
        >
          <MultiChips
            options={LIMITATIONS}
            value={quiz.limitations}
            onChange={(limitations) => onChange({ ...quiz, limitations })}
            noneLabel="Ninguna"
          />
        </StepBlock>
      );
  }
}

/** Lleva el foco al título al montarse: así cada paso se anuncia y el teclado sigue desde arriba. */
const focusHeading = (element: HTMLHeadingElement | null) => element?.focus({ preventScroll: true });

export function StepBlock({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="setup-step">
      <h2 key={title} tabIndex={-1} ref={focusHeading}>
        {title}
      </h2>
      {hint && <p className="setup-hint">{hint}</p>}
      {children}
    </div>
  );
}

/** «¿Cómo te llamas?» El valor vive en el flujo para que «Más tarde» también lo guarde. */
export function NameStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: (name: string) => void;
}) {
  const [focus] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  );
  const clean = value.trim();
  return (
    <form
      className="setup-step"
      onSubmit={(event) => {
        event.preventDefault();
        if (clean) onNext(clean.slice(0, 30));
      }}
    >
      <h2>¿Cómo te llamas?</h2>
      <p className="setup-hint">Así te saluda RB cada día.</p>
      <label className="form-label">
        Nombre
        <input
          autoFocus={focus}
          value={value}
          maxLength={30}
          placeholder="Tu nombre"
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <div className="setup-actions">
        <button type="submit" className="lime-btn" disabled={!clean}>
          Continuar <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
