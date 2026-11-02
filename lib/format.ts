import type { RoutineExercise } from './types';

/** Number formatting for the es-PA locale with at most one decimal. */
export const D = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString('es-PA', { maximumFractionDigits: 1 }) : '0';

/** Integer percentage of a over b, clamped to 0..100. */
export const pct = (a: number, b: number) => Math.round(Math.max(0, Math.min(100, b ? (100 * a) / b : 0)));

/** "domingo, 1 de noviembre" style date. */
export const longDate = (date: Date) =>
  date.toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long' });

/** Default prescription when an exercise is added to a routine. */
export const makeRx = (exerciseId: string): RoutineExercise => ({
  exerciseId,
  targetSets: 3,
  minReps: 8,
  maxReps: 12,
  restSeconds: 90,
});

export const greeting = (date: Date) => {
  const hour = date.getHours();
  return hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
};
