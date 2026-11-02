import { initialData } from './catalog';
import type { ActiveWorkout, AppData, Routine, SetEntry, Workout } from './types';

const KEY = 'rb-fitness:v1';
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value: unknown, max = 160): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= max;
const isDate = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));
const isInteger = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
const isNumber = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

function validSet(value: unknown): value is SetEntry {
  return (
    isRecord(value) &&
    isText(value.id, 160) &&
    isText(value.exerciseId, 160) &&
    isInteger(value.reps, 1, 100) &&
    isNumber(value.weight, 0, 3000) &&
    isDate(value.performedAt)
  );
}
function validRoutine(value: unknown): value is Routine {
  if (
    !isRecord(value) ||
    !isText(value.id) ||
    !(typeof value.name === 'string' && value.name.length <= 65) ||
    !(typeof value.subtitle === 'string' && value.subtitle.length <= 90) ||
    !isText(value.tag) ||
    !Array.isArray(value.exercises) ||
    value.exercises.length > 100
  )
    return false;
  if (value.isRest !== undefined && typeof value.isRest !== 'boolean') return false;
  if (value.isFlexible !== undefined && typeof value.isFlexible !== 'boolean') return false;
  return value.exercises.every(
    (rx: unknown) =>
      isRecord(rx) &&
      isText(rx.exerciseId) &&
      isInteger(rx.targetSets, 1, 20) &&
      isInteger(rx.minReps, 1, 100) &&
      isInteger(rx.maxReps, rx.minReps as number, 100) &&
      isInteger(rx.restSeconds, 0, 1800)
  );
}
function validWorkout(value: unknown): value is Workout {
  return (
    isRecord(value) &&
    isText(value.id) &&
    isText(value.routineId) &&
    isText(value.routineName) &&
    isDate(value.startedAt) &&
    isDate(value.endedAt) &&
    Date.parse(value.startedAt as string) <= Date.parse(value.endedAt as string) &&
    Array.isArray(value.sets) &&
    value.sets.length <= 300 &&
    value.sets.every(validSet)
  );
}
function validActive(value: unknown): value is ActiveWorkout {
  return (
    isRecord(value) &&
    isText(value.id) &&
    isText(value.routineId) &&
    isDate(value.startedAt) &&
    Array.isArray(value.sets) &&
    value.sets.length <= 300 &&
    value.sets.every(validSet)
  );
}

/** Validate every nested data shape before using untrusted backup JSON. */
export function safeParse(raw: string, includeActive = false): AppData {
  const value: unknown = JSON.parse(raw);
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Array.isArray(value.routines) ||
    !Array.isArray(value.workouts) ||
    !isRecord(value.profile)
  ) {
    throw new Error('El archivo no corresponde al formato RB v1.');
  }
  if (
    value.routines.length < 1 ||
    value.routines.length > 100 ||
    value.workouts.length > 30000 ||
    value.workouts.reduce(
      (count: number, w: unknown) => count + (isRecord(w) && Array.isArray(w.sets) ? w.sets.length : 0),
      0
    ) > 150000 ||
    !value.routines.every(validRoutine) ||
    !value.workouts.every(validWorkout)
  ) {
    throw new Error('El respaldo contiene rutinas o sesiones inválidas.');
  }
  const p = value.profile;
  if (
    !(typeof p.name === 'string' && p.name.length <= 40) ||
    !(typeof p.gym === 'string' && p.gym.length <= 80) ||
    !['muscle', 'strength', 'loss', 'maintenance'].includes(String(p.goal)) ||
    !isInteger(p.daysPerWeek, 1, 7) ||
    !['kg', 'lb'].includes(String(p.weightUnit)) ||
    !(p.bodyweightKg === null || isNumber(p.bodyweightKg, 0, 500))
  ) {
    throw new Error('Los datos del perfil no son válidos.');
  }
  const routines = value.routines as Routine[];
  const workoutIds = new Set<string>();
  for (const w of value.workouts as Workout[]) {
    if (workoutIds.has(w.id)) throw new Error('El respaldo contiene sesiones duplicadas.');
    workoutIds.add(w.id);
  }
  return {
    version: 1,
    profile: {
      name: p.name as string,
      gym: p.gym as string,
      goal: p.goal as AppData['profile']['goal'],
      daysPerWeek: p.daysPerWeek as number,
      bodyweightKg: p.bodyweightKg as number | null,
      weightUnit: p.weightUnit as 'kg' | 'lb',
    },
    routines,
    workouts: value.workouts as Workout[],
    active:
      includeActive &&
      validActive(value.active) &&
      routines.some((r) => r.id === (value.active as ActiveWorkout).routineId)
        ? (value.active as ActiveWorkout)
        : null, // cloud resumes active sessions; backups do not
    cycleIndex: isInteger(value.cycleIndex, 0, 100000) ? value.cycleIndex % routines.length : 0,
    theme: value.theme === 'light' ? 'light' : 'dark',
    lastRestDate: isDate(value.lastRestDate) ? value.lastRestDate : null,
  };
}
export function loadData(): AppData {
  if (typeof window === 'undefined') return structuredClone(initialData);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return structuredClone(initialData);
    const data = safeParse(raw);
    const original = JSON.parse(raw) as Record<string, unknown>;
    const active = original.active;
    if (validActive(active) && data.routines.some((r) => r.id === active.routineId)) {
      data.active = active;
    }
    return data;
  } catch {
    return structuredClone(initialData);
  }
}
export function downloadBackup(data: AppData) {
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify({ ...data, active: null }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rb-respaldo-${date}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
