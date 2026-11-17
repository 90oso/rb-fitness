import { defaultCycleDay } from './cycles';
import type {
  Experience,
  GymKit,
  Limitation,
  Profile,
  Routine,
  RoutineExercise,
  SessionMinutes,
} from './types';

/**
 * Motor de propuestas del arranque guiado. Puro y determinista: a partir de las respuestas del cuestionario
 * arma semanas de 7 días (entrenamiento + descanso) con ejercicios del catálogo. Se prueba en
 * `npm run test:planner`. Las tablas siguen la especificación `docs/superpowers/specs/2026-11-17-arranque-guiado-design.md`.
 */

export type DaysPerWeek = 2 | 3 | 4 | 5 | 6;
export interface PlannerInput {
  goal: Profile['goal'];
  experience: Experience;
  daysPerWeek: DaysPerWeek;
  sessionMinutes: SessionMinutes;
  kit: GymKit;
  limitations: Limitation[];
}
export type Split = 'fullbody' | 'upperlower' | 'ppl' | 'pplul' | 'pplfull' | 'bodypart';
export interface Proposal {
  id: string;
  title: string;
  why: string;
  split: Split;
  daysPerWeek: DaysPerWeek;
  week: Routine[];
  /** Minutos estimados por sesión (media de los días de entrenamiento). */
  minutes: number;
}
type Role = 'compound' | 'accessory';
type Volume = Pick<RoutineExercise, 'targetSets' | 'minReps' | 'maxReps' | 'restSeconds'>;

export const DAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
export const SPLIT_LABEL: Record<Split, string> = {
  fullbody: 'Cuerpo completo',
  upperlower: 'Torso / Pierna',
  ppl: 'Empuje / Tirón / Pierna',
  pplul: 'Empuje / Tirón / Pierna + Torso / Pierna',
  pplfull: 'Empuje / Tirón / Pierna + Cuerpo completo',
  bodypart: 'Un grupo por día',
};

/** Lunes primero: qué días de la semana se entrena según cuántos días se eligieron. */
export function weekPattern(days: DaysPerWeek): boolean[] {
  const T = true;
  const F = false;
  return {
    2: [T, F, F, T, F, F, F],
    3: [T, F, T, F, T, F, F],
    4: [T, T, F, T, T, F, F],
    5: [T, T, T, T, T, F, F],
    6: [T, T, T, T, T, T, F],
  }[days];
}

/** Repartos que tienen sentido para esos días; el primero es el principal. */
export function splitsFor(days: DaysPerWeek): Split[] {
  return {
    2: ['fullbody', 'upperlower'] as Split[],
    3: ['fullbody', 'ppl'] as Split[],
    4: ['upperlower', 'pplfull'] as Split[],
    5: ['pplul', 'bodypart'] as Split[],
    6: ['ppl', 'upperlower'] as Split[],
  }[days];
}

const VOLUME: Record<Profile['goal'], Record<Role, Volume>> = {
  muscle: {
    compound: { targetSets: 3, minReps: 6, maxReps: 10, restSeconds: 120 },
    accessory: { targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 90 },
  },
  strength: {
    compound: { targetSets: 4, minReps: 4, maxReps: 6, restSeconds: 150 },
    accessory: { targetSets: 3, minReps: 6, maxReps: 8, restSeconds: 90 },
  },
  loss: {
    compound: { targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
    accessory: { targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 60 },
  },
  maintenance: {
    compound: { targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
    accessory: { targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 60 },
  },
};

/** Series × reps / descanso por objetivo y experiencia; el principiante hace menos, el avanzado algo más. */
export function volumeFor(goal: Profile['goal'], experience: Experience, role: Role): Volume {
  const base = { ...VOLUME[goal][role] };
  if (experience === 'beginner') {
    if (role === 'accessory') base.targetSets = 2;
    if (goal === 'strength' && role === 'compound')
      return { targetSets: 3, minReps: 5, maxReps: 8, restSeconds: 120 };
  }
  if (experience === 'advanced' && role === 'compound') base.targetSets = Math.min(5, base.targetSets + 1);
  return base;
}

/** Cuántos ejercicios caben: por experiencia y por minutos (≈ 8 min por ejercicio), nunca menos de 4. */
export function exerciseBudget(experience: Experience, minutes: SessionMinutes): number {
  const byExperience = { beginner: 5, intermediate: 7, advanced: 8 }[experience];
  return Math.max(4, Math.min(byExperience, Math.floor(minutes / 8)));
}

const EXCLUDED: Record<Limitation, string[]> = {
  knees: [
    'lunges',
    'rear-lunge',
    'split-squat',
    'smith-split-squat',
    'step-ups',
    'hack-squat',
    'smith-squat',
    'dumbbell-squat',
    'bodyweight-squat',
    'plie-squat',
  ],
  shoulders: [
    'shoulder-press',
    'dumbbell-shoulder-press',
    'arnold-press',
    'smith-shoulder-press',
    'upright-row-cable',
    'dip-machine',
    'bench-dips',
    'front-raise',
  ],
  lowerBack: [
    'db-rdl',
    'smith-rdl',
    'bent-over-db-row',
    'smith-row',
    'back-extension',
    'smith-squat',
    'dumbbell-squat',
    'plie-squat',
    'russian-twist',
    'woodchop',
  ],
  wrists: [
    'pushup',
    'incline-pushup',
    'bench-dips',
    'lying-db-extension',
    'close-grip-smith',
    'reverse-curl',
    'zottman-curl',
    'kickback',
  ],
};

/** Ejercicios que no se proponen con esas limitaciones (listas conservadoras; siempre se puede editar). */
export function excludedBy(limitations: Limitation[]): Set<string> {
  return new Set(limitations.flatMap((limitation) => EXCLUDED[limitation]));
}

type Slot =
  | 'horizontalPress'
  | 'inclinePress'
  | 'chestIsolation'
  | 'verticalPull'
  | 'horizontalRow'
  | 'backAccessory'
  | 'shoulderPress'
  | 'lateralRaise'
  | 'rearDelt'
  | 'tricepsPush'
  | 'tricepsOverhead'
  | 'bicepsCurl'
  | 'bicepsHammer'
  | 'squatPattern'
  | 'hinge'
  | 'quadIsolation'
  | 'hamstringIsolation'
  | 'glute'
  | 'calves'
  | 'core';

/** Candidatos por hueco y equipo, en orden de preferencia; los días A/B/C toman el 1.º, 2.º, 3.º disponible. */
const CANDIDATES: Record<Slot, Record<GymKit, string[]>> = {
  horizontalPress: {
    machines: ['chest-press', 'smith-bench', 'pec-deck'],
    full: ['dumbbell-bench', 'chest-press', 'smith-bench'],
    dumbbells: ['dumbbell-bench', 'pushup', 'dumbbell-fly'],
  },
  inclinePress: {
    machines: ['machine-incline-press', 'smith-incline', 'cable-crossover'],
    full: ['incline-dumbbell', 'machine-incline-press', 'smith-incline'],
    dumbbells: ['incline-dumbbell', 'incline-pushup', 'dumbbell-fly'],
  },
  chestIsolation: {
    machines: ['pec-deck', 'cable-crossover', 'low-cable-crossover'],
    full: ['pec-deck', 'dumbbell-fly', 'cable-crossover'],
    dumbbells: ['dumbbell-fly', 'dumbbell-pullover', 'pushup'],
  },
  verticalPull: {
    machines: ['lat-pulldown', 'close-grip-pulldown', 'underhand-pulldown'],
    full: ['lat-pulldown', 'assisted-pullup', 'chin-up'],
    dumbbells: ['dumbbell-pullover', 'one-arm-row', 'chin-up'],
  },
  horizontalRow: {
    machines: ['seated-row', 'cable-row', 'high-row'],
    full: ['seated-row', 'one-arm-row', 'cable-row'],
    dumbbells: ['one-arm-row', 'bent-over-db-row'],
  },
  backAccessory: {
    machines: ['straight-arm-pulldown', 'high-row', 'back-extension'],
    full: ['straight-arm-pulldown', 'smith-row', 'back-extension'],
    dumbbells: ['dumbbell-pullover', 'bent-over-db-row'],
  },
  shoulderPress: {
    machines: ['shoulder-press', 'smith-shoulder-press'],
    full: ['dumbbell-shoulder-press', 'shoulder-press', 'arnold-press'],
    dumbbells: ['dumbbell-shoulder-press', 'arnold-press'],
  },
  lateralRaise: {
    machines: ['cable-lateral-raise', 'lateral-raise'],
    full: ['lateral-raise', 'cable-lateral-raise'],
    dumbbells: ['lateral-raise', 'front-raise'],
  },
  rearDelt: {
    machines: ['reverse-machine-fly', 'face-pull'],
    full: ['face-pull', 'rear-delt-fly-db', 'reverse-machine-fly'],
    dumbbells: ['rear-delt-fly-db'],
  },
  tricepsPush: {
    machines: ['tricep-pushdown', 'rope-pushdown', 'machine-triceps-extension'],
    full: ['tricep-pushdown', 'dip-machine', 'rope-pushdown'],
    dumbbells: ['bench-dips', 'kickback', 'lying-db-extension'],
  },
  tricepsOverhead: {
    machines: ['overhead-rope-extension', 'machine-triceps-extension'],
    full: ['overhead-rope-extension', 'db-overhead-extension', 'lying-db-extension'],
    dumbbells: ['db-overhead-extension', 'lying-db-extension'],
  },
  bicepsCurl: {
    machines: ['machine-curl', 'cable-curl', 'preacher-curl'],
    full: ['bicep-curl', 'machine-curl', 'cable-curl'],
    dumbbells: ['bicep-curl', 'incline-curl', 'concentration-curl'],
  },
  bicepsHammer: {
    machines: ['rope-hammer-curl', 'cable-curl'],
    full: ['hammer-curl', 'rope-hammer-curl'],
    dumbbells: ['hammer-curl', 'zottman-curl'],
  },
  squatPattern: {
    machines: ['leg-press', 'hack-squat', 'smith-squat'],
    full: ['leg-press', 'hack-squat', 'smith-squat', 'dumbbell-squat'],
    dumbbells: ['dumbbell-squat', 'bodyweight-squat', 'plie-squat'],
  },
  hinge: {
    machines: ['smith-rdl', 'back-extension', 'pull-through'],
    full: ['db-rdl', 'smith-rdl', 'pull-through'],
    dumbbells: ['db-rdl', 'single-glute-bridge'],
  },
  quadIsolation: {
    machines: ['leg-extension', 'single-leg-extension'],
    full: ['leg-extension', 'split-squat', 'lunges'],
    dumbbells: ['split-squat', 'lunges', 'step-ups'],
  },
  hamstringIsolation: {
    machines: ['leg-curl', 'lying-leg-curl', 'standing-leg-curl'],
    full: ['leg-curl', 'lying-leg-curl', 'db-rdl'],
    dumbbells: ['db-rdl', 'single-glute-bridge'],
  },
  glute: {
    machines: ['hip-thrust', 'hip-abductor', 'cable-kickback'],
    full: ['hip-thrust', 'cable-kickback', 'rear-lunge'],
    dumbbells: ['hip-thrust', 'single-glute-bridge', 'rear-lunge'],
  },
  calves: {
    machines: ['calf-raise', 'seated-calf', 'leg-press-calf'],
    full: ['calf-raise', 'seated-calf', 'smith-calf'],
    dumbbells: ['db-calf', 'calf-raise'],
  },
  core: {
    machines: ['ab-crunch', 'cable-crunch', 'pallof-press'],
    full: ['ab-crunch', 'cable-crunch', 'hanging-leg-raise'],
    dumbbells: ['plank', 'dead-bug', 'bicycle-crunch', 'russian-twist'],
  },
};

type DayKind =
  'fullbody' | 'upper' | 'lower' | 'push' | 'pull' | 'legs' | 'chest' | 'back' | 'shoulders' | 'arms';
interface TemplateSlot {
  slot: Slot;
  role: Role;
}
const c = (slot: Slot): TemplateSlot => ({ slot, role: 'compound' });
const a = (slot: Slot): TemplateSlot => ({ slot, role: 'accessory' });

/** Plantillas de día: huecos en orden (básicos primero; el presupuesto recorta por el final). */
const TEMPLATES: Record<DayKind, TemplateSlot[][]> = {
  fullbody: [
    [
      c('squatPattern'),
      c('horizontalPress'),
      c('horizontalRow'),
      c('hinge'),
      a('shoulderPress'),
      a('bicepsCurl'),
      a('core'),
    ],
    [
      c('hinge'),
      c('inclinePress'),
      c('verticalPull'),
      a('quadIsolation'),
      a('lateralRaise'),
      a('tricepsPush'),
      a('core'),
    ],
    [
      c('squatPattern'),
      c('horizontalPress'),
      c('verticalPull'),
      a('hamstringIsolation'),
      a('rearDelt'),
      a('bicepsHammer'),
      a('calves'),
    ],
  ],
  upper: [
    [
      c('horizontalPress'),
      c('horizontalRow'),
      c('shoulderPress'),
      c('verticalPull'),
      a('lateralRaise'),
      a('tricepsPush'),
      a('bicepsCurl'),
    ],
    [
      c('inclinePress'),
      c('verticalPull'),
      c('horizontalRow'),
      a('chestIsolation'),
      a('rearDelt'),
      a('tricepsOverhead'),
      a('bicepsHammer'),
    ],
  ],
  lower: [
    [c('squatPattern'), c('hinge'), a('quadIsolation'), a('hamstringIsolation'), a('calves'), a('core')],
    [c('hinge'), c('squatPattern'), a('glute'), a('hamstringIsolation'), a('calves'), a('core')],
  ],
  push: [
    [
      c('horizontalPress'),
      c('inclinePress'),
      c('shoulderPress'),
      a('lateralRaise'),
      a('chestIsolation'),
      a('tricepsPush'),
      a('tricepsOverhead'),
    ],
  ],
  pull: [
    [
      c('verticalPull'),
      c('horizontalRow'),
      a('backAccessory'),
      a('rearDelt'),
      a('bicepsCurl'),
      a('bicepsHammer'),
      a('core'),
    ],
  ],
  legs: [
    [
      c('squatPattern'),
      c('hinge'),
      a('quadIsolation'),
      a('hamstringIsolation'),
      a('glute'),
      a('calves'),
      a('core'),
    ],
  ],
  chest: [[c('horizontalPress'), c('inclinePress'), a('chestIsolation'), a('tricepsPush')]],
  back: [[c('verticalPull'), c('horizontalRow'), a('backAccessory'), a('rearDelt')]],
  shoulders: [[c('shoulderPress'), a('lateralRaise'), a('rearDelt'), a('core')]],
  arms: [[a('bicepsCurl'), a('tricepsPush'), a('bicepsHammer'), a('tricepsOverhead'), a('core')]],
};
/** Si una limitación deja un día corto, se completa con estos huecos (en orden) hasta llegar a cuatro. */
const FILLERS: Slot[] = [
  'core',
  'calves',
  'lateralRaise',
  'backAccessory',
  'glute',
  'hamstringIsolation',
  'bicepsCurl',
  'tricepsPush',
];

const DAY_META: Record<DayKind, { name: string; tag: string; lettered: boolean }> = {
  fullbody: { name: 'Cuerpo completo', tag: 'FULL BODY', lettered: true },
  upper: { name: 'Torso', tag: 'TORSO', lettered: true },
  lower: { name: 'Pierna', tag: 'PIERNA', lettered: true },
  push: { name: 'Empuje', tag: 'PUSH DAY', lettered: false },
  pull: { name: 'Tirón', tag: 'PULL DAY', lettered: false },
  legs: { name: 'Pierna', tag: 'LEG DAY', lettered: false },
  chest: { name: 'Pecho', tag: 'PECHO', lettered: false },
  back: { name: 'Espalda', tag: 'ESPALDA', lettered: false },
  shoulders: { name: 'Hombros', tag: 'HOMBROS', lettered: false },
  arms: { name: 'Brazos', tag: 'BRAZOS', lettered: false },
};

/** Secuencia de días de entrenamiento de cada reparto, con su variante (A=0, B=1, C=2). */
interface DayRef {
  kind: DayKind;
  variant: number;
}
function daySequence(split: Split, days: DaysPerWeek): DayRef[] {
  const fixed = (kinds: DayKind[], variants: number[] = []): DayRef[] =>
    kinds.slice(0, days).map((kind, i) => ({ kind, variant: variants[i] ?? 0 }));
  const cycle = (kinds: DayKind[]): DayRef[] =>
    Array.from({ length: days }, (_, i) => ({
      kind: kinds[i % kinds.length],
      variant: Math.floor(i / kinds.length),
    }));
  switch (split) {
    case 'fullbody':
      return cycle(['fullbody']);
    case 'upperlower':
      return cycle(['upper', 'lower']);
    case 'ppl':
      return cycle(['push', 'pull', 'legs']);
    case 'pplul':
      return fixed(['push', 'pull', 'legs', 'upper', 'lower'], [0, 0, 0, 0, 1]);
    case 'pplfull':
      return fixed(['push', 'pull', 'legs', 'fullbody']);
    case 'bodypart':
      return fixed(['chest', 'back', 'legs', 'shoulders', 'arms']);
  }
}

function pickExercise(slot: Slot, kit: GymKit, variant: number, excluded: Set<string>, used: Set<string>) {
  const available = CANDIDATES[slot][kit].filter((id) => !excluded.has(id) && !used.has(id));
  return available.length ? available[variant % available.length] : null;
}

function buildDay(kind: DayKind, variant: number, index: number, input: PlannerInput, id: string): Routine {
  const templates = TEMPLATES[kind];
  const template = templates[variant % templates.length];
  const excluded = excludedBy(input.limitations);
  const used = new Set<string>();
  const chosen: { id: string; role: Role }[] = [];
  for (const { slot, role } of template) {
    const exerciseId = pickExercise(slot, input.kit, variant, excluded, used);
    if (!exerciseId) continue; // la limitación dejó el hueco sin candidato: se omite
    used.add(exerciseId);
    chosen.push({ id: exerciseId, role });
  }
  for (const slot of FILLERS) {
    if (chosen.length >= 4) break;
    const exerciseId = pickExercise(slot, input.kit, variant, excluded, used);
    if (!exerciseId) continue;
    used.add(exerciseId);
    chosen.push({ id: exerciseId, role: 'accessory' });
  }
  const budget = exerciseBudget(input.experience, input.sessionMinutes);
  const exercises = chosen.slice(0, budget).map(({ id: exerciseId, role }, i) => ({
    exerciseId,
    // El primer ejercicio del día es el principal aunque la plantilla lo tuviera como accesorio.
    ...volumeFor(input.goal, input.experience, i === 0 ? 'compound' : role),
  }));
  const meta = DAY_META[kind];
  const letter = meta.lettered
    ? ` ${String.fromCharCode(65 + variant)}`
    : variant > 0
      ? ` ${String.fromCharCode(65 + variant)}`
      : '';
  return {
    id,
    name: `${meta.name}${letter}`,
    subtitle: `Día ${index + 1}`,
    tag: meta.tag,
    exercises,
  };
}

/** Semana de 7 días: los de entrenamiento del reparto sobre `weekPattern`, descansos en los huecos. */
export function buildWeek(split: Split, input: PlannerInput, uid: () => string): Routine[] {
  const sequence = daySequence(split, input.daysPerWeek);
  const pattern = weekPattern(input.daysPerWeek);
  let trainingIndex = 0;
  return pattern.map((trains, i) => {
    if (!trains) {
      return { ...defaultCycleDay(uid(), true), name: 'Descanso', subtitle: 'Recuperación', tag: 'REST DAY' };
    }
    const { kind, variant } = sequence[trainingIndex];
    const routine = buildDay(kind, variant, trainingIndex, input, uid());
    trainingIndex++;
    return { ...routine, subtitle: `Día ${i + 1} · ${SPLIT_LABEL[split]}` };
  });
}

/** 5 min de calentamiento más series × (45 s de trabajo + descanso). */
export function estimateMinutes(routine: Routine): number {
  const seconds = routine.exercises.reduce((sum, rx) => sum + rx.targetSets * (45 + rx.restSeconds), 0);
  return Math.round(5 + seconds / 60);
}

function why(split: Split, days: DaysPerWeek): string {
  switch (split) {
    case 'fullbody':
      return `Cada músculo dos o tres veces por semana: lo que más rinde con ${days} días.`;
    case 'upperlower':
      return days === 2
        ? 'Un día de torso y uno de pierna: sencillo y completo.'
        : 'Torso y pierna en días alternos: buen reparto de trabajo y descanso.';
    case 'ppl':
      return days >= 6
        ? 'Cada grupo dos veces por semana, el clásico de seis días.'
        : 'Cada grupo una vez por semana en sesiones cortas y enfocadas.';
    case 'pplul':
      return 'Cinco días: los tres clásicos más un torso y una pierna extra.';
    case 'pplfull':
      return 'Tres días enfocados y uno de repaso general.';
    case 'bodypart':
      return 'Pecho, espalda, pierna, hombros y brazos: sesiones enfocadas, muy usado en gimnasios de máquinas.';
  }
}

function proposal(
  id: string,
  split: Split,
  input: PlannerInput,
  uid: () => string,
  fallback = false
): Proposal {
  const week = buildWeek(split, input, uid);
  const training = week.filter((routine) => !routine.isRest);
  const minutes = Math.round(
    training.reduce((sum, routine) => sum + estimateMinutes(routine), 0) / training.length
  );
  return {
    id,
    title: `${SPLIT_LABEL[split]} · ${input.daysPerWeek} días`,
    why: why(split, input.daysPerWeek) + (fallback ? ' Por si alguna semana no llegas a todos.' : ''),
    split,
    daysPerWeek: input.daysPerWeek,
    week,
    minutes,
  };
}

/** Dos o tres propuestas: la principal, la alternativa con los mismos días y la principal con un día menos. */
export function proposals(input: PlannerInput, uid: () => string): Proposal[] {
  const [principal, alternative] = splitsFor(input.daysPerWeek);
  const list = [proposal('p1', principal, input, uid)];
  if (alternative) list.push(proposal('p2', alternative, input, uid));
  if (input.daysPerWeek > 2) {
    const fewer = { ...input, daysPerWeek: (input.daysPerWeek - 1) as DaysPerWeek };
    list.push(proposal('p3', splitsFor(fewer.daysPerWeek)[0], fewer, uid, true));
  }
  return list;
}
