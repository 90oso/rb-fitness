export type Muscle =
  | 'Pecho'
  | 'Espalda'
  | 'Hombros'
  | 'Tríceps'
  | 'Bíceps'
  | 'Cuádriceps'
  | 'Femoral'
  | 'Glúteos'
  | 'Gemelos'
  | 'Abdomen';
export type Equipment = 'Máquina' | 'Mancuernas' | 'Polea' | 'Smith' | 'Peso corporal';
/** Optional short clip for an exercise: a same-origin path (`/exercises/<id>/loop.mp4`) or an https URL. */
export interface ExerciseVideo {
  src: string;
  /** Who made it and under which license, shown under the player. */
  credit?: string;
}
/** Visual guide for an exercise: two frames (start, end) and an optional short video. */
export interface ExerciseMedia {
  frames: [string, string];
  video?: ExerciseVideo;
  /** Identifier in the source database the frames were taken from (for credits). */
  source?: string;
}
export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  equipment: Equipment;
  instruction: string;
  tip: string;
  media?: ExerciseMedia;
}
export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  minReps: number;
  maxReps: number;
  restSeconds: number;
}
export interface Routine {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  exercises: RoutineExercise[];
  isRest?: boolean;
  isFlexible?: boolean;
}
export interface SetEntry {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  performedAt: string;
}
export interface Workout {
  id: string;
  routineId: string;
  routineName: string;
  startedAt: string;
  endedAt: string;
  sets: SetEntry[];
}
export interface ActiveWorkout {
  id: string;
  routineId: string;
  startedAt: string;
  sets: SetEntry[];
}
export interface Profile {
  name: string;
  gym: string;
  goal: 'muscle' | 'strength' | 'loss' | 'maintenance';
  daysPerWeek: number;
  bodyweightKg: number | null;
  weightUnit: 'kg' | 'lb';
}
export interface AppData {
  version: 1;
  profile: Profile;
  routines: Routine[];
  workouts: Workout[];
  active: ActiveWorkout | null;
  cycleIndex: number;
  theme: 'dark' | 'light';
  lastRestDate: string | null;
}
