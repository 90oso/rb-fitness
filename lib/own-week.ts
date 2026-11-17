import { defaultCycleDay } from './cycles';
import { volumeFor, weekPattern, type DaysPerWeek } from './planner';
import type { Experience, Muscle, Profile, Routine, RoutineExercise } from './types';

export interface OwnDay {
  name: string;
  muscles: Muscle[];
  exerciseIds: string[];
}

/** Subtítulo del día con sus músculos; más de tres se resumen («Pecho · Tríceps · Hombros +2») para caber en 90. */
export function ownSubtitle(muscles: Muscle[]): string {
  if (muscles.length === 0) return 'Mi rutina';
  if (muscles.length <= 3) return muscles.join(' · ');
  return `${muscles.slice(0, 3).join(' · ')} +${muscles.length - 3}`;
}

/**
 * Semana de 7 días del asistente «ya tengo rutina»: los días de entrenamiento en el orden del usuario sobre
 * `weekPattern`, descansos en los huecos. Los ejercicios llevan el volumen de accesorio del objetivo.
 */
export function buildOwnWeek(
  days: DaysPerWeek,
  list: OwnDay[],
  goal: Profile['goal'],
  experience: Experience,
  uid: () => string
): Routine[] {
  let n = 0;
  return weekPattern(days).map((trains) => {
    if (!trains) {
      return { ...defaultCycleDay(uid(), true), name: 'Descanso', subtitle: 'Recuperación', tag: 'REST DAY' };
    }
    const own = list[n++] ?? { name: '', muscles: [], exerciseIds: [] };
    const exercises: RoutineExercise[] = own.exerciseIds.map((exerciseId) => ({
      exerciseId,
      ...volumeFor(goal, experience, 'accessory'),
    }));
    return {
      id: uid(),
      name: own.name.trim().slice(0, 40) || `Día ${n}`,
      subtitle: ownSubtitle(own.muscles),
      tag: (own.muscles[0] ?? 'MI RUTINA').toUpperCase(),
      exercises,
    };
  });
}
