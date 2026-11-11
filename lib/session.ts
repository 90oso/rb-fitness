import { progressionAdvice } from './metrics';
import type { Routine, RoutineExercise, SetEntry, Workout } from './types';

/** Reglas puras de la sesión activa. Sin React: se prueban con `npm run test:session`. */

/** La sesión entrena sobre su propia copia de ejercicios; sin copia (sesiones de 0.8.x) usa la rutina. */
export function sessionExercises(
  active: { exercises?: RoutineExercise[] },
  routine: Routine | undefined
): RoutineExercise[] {
  return active.exercises ?? routine?.exercises ?? [];
}

export function exerciseProgress(sets: SetEntry[], rx: RoutineExercise) {
  const done = sets.filter((set) => set.exerciseId === rx.exerciseId).length;
  return { done, target: rx.targetSets, complete: done >= rx.targetSets };
}

/**
 * Siguiente ejercicio sin completar: primero los que vienen después del actual, luego desde el principio.
 * `null` cuando todos están completos. Un actual ausente busca desde el inicio.
 */
export function nextPendingExercise(
  exercises: RoutineExercise[],
  sets: SetEntry[],
  currentId: string
): string | null {
  const index = exercises.findIndex((rx) => rx.exerciseId === currentId);
  const order = [...exercises.slice(index + 1), ...exercises.slice(0, index + 1)];
  const next = order.find((rx) => rx.exerciseId !== currentId && !exerciseProgress(sets, rx).complete);
  return next?.exerciseId ?? null;
}

export const MAX_REST_SECONDS = 1800;

/** Cambia el descanso de un ejercicio de la sesión (acotado a 0–1800 s) sin mutar la lista. */
export function adjustRest(
  exercises: RoutineExercise[],
  exerciseId: string,
  deltaSeconds: number
): RoutineExercise[] {
  return exercises.map((rx) =>
    rx.exerciseId === exerciseId
      ? { ...rx, restSeconds: Math.max(0, Math.min(MAX_REST_SECONDS, rx.restSeconds + deltaSeconds)) }
      : rx
  );
}

const rxKey = (rx: RoutineExercise) =>
  [rx.exerciseId, rx.targetSets, rx.minReps, rx.maxReps, rx.restSeconds].join('|');

/** ¿La sesión cambió ejercicios, orden u objetivos respecto a la rutina? Sin rutina no hay nada que guardar. */
export function sessionDiffersFromRoutine(
  session: RoutineExercise[],
  routine: RoutineExercise[] | undefined
): boolean {
  if (!routine) return false;
  return session.length !== routine.length || session.some((rx, i) => rxKey(rx) !== rxKey(routine[i]));
}

/** Cuántos ejercicios de la lista tienen propuesta de subir de peso según el historial. */
export function raiseCount(workouts: Workout[], exercises: RoutineExercise[]): number {
  return exercises.filter(
    (rx) => progressionAdvice(workouts, rx.exerciseId, rx.targetSets, rx.maxReps)?.kind === 'increase'
  ).length;
}

/** Descanso en curso guardado en el dispositivo para sobrevivir una recarga. */
export const REST_KEY = 'rb-rest';
export interface RestRecord {
  activeId: string;
  exerciseId: string;
  endsAt: number;
}

/** Lee el registro guardado; `null` si no es válido, es de otra sesión o ya venció. */
export function parseRestRecord(raw: string | null, activeId: string, now: number): RestRecord | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== 'object' ||
      value === null ||
      (value as RestRecord).activeId !== activeId ||
      typeof (value as RestRecord).exerciseId !== 'string' ||
      typeof (value as RestRecord).endsAt !== 'number' ||
      !Number.isFinite((value as RestRecord).endsAt) ||
      (value as RestRecord).endsAt <= now
    )
      return null;
    const { exerciseId, endsAt } = value as RestRecord;
    return { activeId, exerciseId, endsAt };
  } catch {
    return null;
  }
}
