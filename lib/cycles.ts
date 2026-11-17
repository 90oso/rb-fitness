import type { AppData, Routine } from './types';

/** A cycle can be any ordered combination of workouts and rest days. */
export function addCycleDay(data: AppData, routine: Routine): AppData {
  if (data.routines.some((r) => r.id === routine.id)) throw new Error('El identificador ya existe.');
  if (data.routines.length >= 40) throw new Error('Límite de 40 días por ciclo.');
  const nextId = data.routines[data.cycleIndex]?.id;
  const routines = [...data.routines, routine];
  return { ...data, routines, cycleIndex: nextId ? routines.findIndex((r) => r.id === nextId) : 0 };
}
/**
 * Añade días al final respetando las reglas de `addCycleDay` (ids únicos, máximo 40). Devuelve cuántos
 * entraron y cuántos quedaron fuera por el límite; el día «siguiente» del ciclo no cambia.
 */
export function appendCycleDays(
  data: AppData,
  routines: Routine[]
): { data: AppData; added: number; dropped: number } {
  let next = data;
  let added = 0;
  for (const routine of routines) {
    if (next.routines.length >= 40) break;
    next = addCycleDay(next, routine);
    added++;
  }
  return { data: next, added, dropped: routines.length - added };
}
export function duplicateCycleDay(data: AppData, routineId: string, newId: string): AppData {
  const r = data.routines.find((r) => r.id === routineId);
  if (!r) return data;
  const duplicate: Routine = {
    ...r,
    id: newId,
    name: `${r.name} (copia)`,
    exercises: r.exercises.map((ex) => ({ ...ex })),
  };
  return addCycleDay(data, duplicate);
}
export function moveCycleDay(data: AppData, routineId: string, direction: -1 | 1): AppData {
  const from = data.routines.findIndex((r) => r.id === routineId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= data.routines.length) return data;
  const nextId = data.routines[data.cycleIndex]?.id;
  const routines = [...data.routines];
  [routines[from], routines[to]] = [routines[to], routines[from]];
  return {
    ...data,
    routines,
    cycleIndex: Math.max(
      0,
      routines.findIndex((r) => r.id === nextId)
    ),
  };
}
export function removeCycleDay(data: AppData, routineId: string): AppData {
  if (data.active?.routineId === routineId) throw new Error('Finaliza o descarta primero la sesión activa.');
  if (!data.routines.some((r) => r.id === routineId)) return data;
  // El ciclo puede quedar vacío: Hoy y Entrenar muestran entonces «Aún no tienes rutina».
  const nextId = data.routines[data.cycleIndex]?.id;
  const routines = data.routines.filter((r) => r.id !== routineId);
  const preserved = routines.findIndex((r) => r.id === nextId);
  return {
    ...data,
    routines,
    cycleIndex: preserved >= 0 ? preserved : Math.max(0, Math.min(data.cycleIndex, routines.length - 1)),
  };
}
export function defaultCycleDay(id: string, isRest = false): Routine {
  return {
    id,
    name: isRest ? 'Descanso' : 'Nuevo entrenamiento',
    subtitle: isRest ? 'Recuperación' : 'Día personalizado',
    tag: isRest ? 'REST' : 'MI RUTINA',
    isRest,
    exercises: [],
  };
}
