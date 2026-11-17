# Arranque guiado: nombre, «¿ya tienes rutina?», propuestas por reglas y estados vacíos

Fecha: 2026-11-17 · Estado: aprobado en conversación · Un solo PR (versión 0.11.0).

## 1. Objetivo

Que una persona nueva no se encuentre un ciclo de 5 días sin explicación. Al entrar por primera vez, RB le pregunta su
nombre y si ya tiene rutina: si la tiene, la ayuda a pasarla a RB día por día; si no, le hace seis preguntas y le
propone dos o tres ciclos semanales adecuados, armados con reglas a partir del catálogo; y si prefiere explorar,
puede empezar con el ciclo de ejemplo. Todo lo que sale del arranque es un ciclo normal, editable con el editor.

Decisiones tomadas con el usuario: propuestas por **reglas** (no IA); el **ejemplo se conserva** como tercera opción;
**estados vacíos** reales por si alguien sale sin elegir; el arranque **empieza por el nombre**; **sin** sexo, edad ni
altura; el ciclo propuesto es una **semana con días de descanso**; **una sola entrega**.

### En alcance

- Flujo de arranque a pantalla completa para cuentas nuevas, con salida «Más tarde».
- Tres caminos: «Ya tengo rutina» (asistente), «Propónme una» (cuestionario + propuestas), «Ciclo de ejemplo».
- Motor de propuestas en `lib/planner.ts` con pruebas en Node.
- Campos nuevos de perfil (experiencia, minutos, equipo, limitaciones) editables en Perfil.
- Relanzar desde Entrenar («Armar un ciclo nuevo») con reemplazar o añadir.
- Estados vacíos en Hoy y Entrenar; el ciclo puede tener cero días.
- Línea nueva en Privacidad.

### Fuera de alcance

- Pesos iniciales estimados, calorías, IA generativa, plantillas más allá de los repartos listados, importar de otras apps.

## 2. Datos

```ts
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type SessionMinutes = 30 | 45 | 60 | 75;
export type GymKit = 'machines' | 'full' | 'dumbbells'; // máquinas y poleas · también mancuernas y barras · solo mancuernas y peso corporal
export type Limitation = 'knees' | 'shoulders' | 'lowerBack' | 'wrists';
interface Profile {
  // … actuales …
  experience?: Experience;
  sessionMinutes?: SessionMinutes;
  kit?: GymKit;
  limitations?: Limitation[];
}
interface AppData {
  // … actuales …
  /** 'pending' solo en cuentas creadas desde 0.11.0 hasta que terminan o posponen el arranque. Ausente = hecho. */
  setup?: 'pending' | 'done';
}
```

- `initialData` (cuentas nuevas): `routines: []`, `cycleIndex: 0`, `setup: 'pending'`. Las cuentas existentes no
  traen `setup` y se tratan como hechas; nunca ven el arranque salvo que lo relancen.
- `safeParse` acepta los campos nuevos con sus valores permitidos y descarta en silencio los inválidos; acepta
  `routines: []`.
- `removeCycleDay` deja quitar el último día (el ciclo puede quedar vacío). `addCycleDay` sin cambios.

## 3. Flujo (`components/setup/`)

Pantalla completa sobre el fondo de malla, tarjeta ancha (máx. 560 px), puntos de progreso, botón atrás en cada paso y
«Más tarde» arriba a la derecha (solo en el arranque de cuenta nueva; al relanzar, «Cancelar»). Nada se guarda en la
nube hasta el paso final.

0. **Nombre**: «¿Cómo te llamas?», campo prellenado si el perfil ya tiene un nombre distinto de «Atleta». Continuar.
   (Al relanzar desde Entrenar este paso se salta.)
1. **«¿Ya tienes una rutina?»** Tres tarjetas: **Sí, la paso a RB** · **No, propónme una** · **Empezar con el ciclo de
   ejemplo** (texto pequeño: «5 días con descanso, máquinas; se puede cambiar todo después»).
2. **A · Ya tengo rutina**
   1. «¿Cuántos días entrenas por semana?» (2–6). RB arma la semana con `weekPattern(días)`.
   2. Por cada día de entrenamiento, en orden: «Día N» → nombre (por defecto «Día N») y músculos que trabaja (chips
      con los músculos del catálogo) → **Elegir ejercicios** abre el selector del catálogo prefiltrado a esos músculos
      (prop nueva `preset`), varios a la vez; cada elegido entra con `volumeFor(objetivo, experiencia ?? 'intermediate', 'accessory')`.
      Un día puede quedarse sin ejercicios (se avisa, no se bloquea).
   3. **Resumen de la semana** (tira L–D con nombre y número de ejercicios) → **Crear mi ciclo**.
3. **B · Propónme una** (seis pantallas de un toque, chips grandes)
   objetivo (músculo / fuerza / perder grasa / mantenerme) · experiencia (menos de 6 meses / 6 meses a 2 años / más de
   2 años) · días por semana (2–6) · minutos por sesión (30 / 45 / 60 / 75+) · equipo (`GymKit`) · limitaciones
   (ninguna / rodillas / hombros / espalda baja / muñecas y codos; varias).
   → **Propuestas**: 2 o 3 tarjetas (`proposals(input)`): título («Torso / Pierna · 4 días»), por qué, tira semanal
   L–D con etiquetas cortas, «≈ 50 min por sesión». Tocar una → **vista previa**: los 7 días con sus ejercicios en
   filas compactas («3 × 8–12 · 90 s») → **Usar este ciclo**. Texto fijo al pie: «No sustituye el consejo de un
   profesional. Si tienes una lesión, consúltalo antes.»
4. **C · Ejemplo**: aplica `defaultRoutines`.
5. **Fin**: se guardan nombre, respuestas del cuestionario en el perfil (objetivo y días también), las rutinas, y
   `setup: 'done'`. Toast «Tu ciclo está listo». La app abre en Hoy.
6. **Más tarde** (solo cuenta nueva): guarda el nombre si se escribió, `setup: 'done'` y deja el ciclo vacío → E6.

### Relanzar desde Entrenar

Botón «Armar un ciclo nuevo» en la barra de Entrenar junto a «Nuevo día» y en el estado vacío. Mismo flujo desde el
paso 1. Al final, si el ciclo actual tiene días: diálogo de tres salidas «¿Qué hacemos con tu ciclo actual?» →
**Reemplazar** (rutinas := nuevas, `cycleIndex` 0) · **Añadir al final** · cerrar = volver al flujo. Con sesión activa,
«Reemplazar» no se ofrece (aviso: finaliza la sesión primero).

## 4. Motor de propuestas (`lib/planner.ts`, puro)

```ts
export interface PlannerInput {
  goal: Profile['goal'];
  experience: Experience;
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
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
  daysPerWeek: number;
  week: Routine[];
  minutes: number;
}
export function weekPattern(days: 2 | 3 | 4 | 5 | 6): boolean[]; // lunes primero: 2 T·R·R·T·R·R·R · 3 T·R·T·R·T·R·R · 4 T·T·R·T·T·R·R · 5 T·T·T·T·T·R·R · 6 T·T·T·T·T·T·R
export function splitsFor(days: 2 | 3 | 4 | 5 | 6): Split[]; // principal primero: 2 → fullbody, upperlower · 3 → fullbody, ppl · 4 → upperlower, pplfull · 5 → pplul, bodypart · 6 → ppl, upperlower
export function volumeFor(
  goal,
  experience,
  role: 'compound' | 'accessory'
): Pick<RoutineExercise, 'targetSets' | 'minReps' | 'maxReps' | 'restSeconds'>;
export function exerciseBudget(experience, minutes): number; // max(4, min({beginner:5, intermediate:7, advanced:8}, floor(minutes/8)))
export function excludedBy(limitations): Set<string>;
export function buildWeek(split, input, uid: () => string): Routine[]; // 7 rutinas, descansos incluidos
export function estimateMinutes(routine): number; // 5 + Σ series × (45 s + descanso), en minutos
export function proposals(input, uid): Proposal[]; // [principal(días), alternativa(días) si hay, principal(días−1) si días>2]
```

- **Plantillas de día** (huecos en orden; `c` básico, `a` accesorio; el presupuesto recorta por el final):
  - fullbody A: sentadilla/prensa c · press horizontal c · remo c · bisagra c · press hombro a · bíceps a · abdomen a
  - fullbody B: bisagra c · press inclinado c · jalón c · cuádriceps a · laterales a · tríceps a · abdomen a
  - fullbody C: sentadilla/prensa c · press horizontal c · jalón c · femoral a · deltoide posterior a · martillo a · gemelos a
  - torso A: press horizontal c · remo c · press hombro c · jalón c · laterales a · tríceps a · bíceps a
  - torso B: press inclinado c · jalón c · remo c · aperturas a · deltoide posterior a · tríceps sobre cabeza a · martillo a
  - pierna A: sentadilla/prensa c · bisagra c · cuádriceps a · femoral a · gemelos a · abdomen a
  - pierna B: bisagra c · sentadilla/prensa c · glúteo a · femoral a · gemelos a · abdomen a
  - empuje: press horizontal c · press inclinado c · press hombro c · laterales a · aperturas a · tríceps a · tríceps sobre cabeza a
  - tirón: jalón c · remo c · espalda accesorio a · deltoide posterior a · bíceps a · martillo a · abdomen a
  - pierna (PPL): sentadilla/prensa c · bisagra c · cuádriceps a · femoral a · glúteo a · gemelos a · abdomen a
  - por grupos (5 días): pecho (press horizontal c, press inclinado c, aperturas a, tríceps a) · espalda (jalón c, remo c,
    espalda accesorio a, deltoide posterior a) · pierna (PPL) · hombros (press hombro c, laterales a, deltoide posterior a,
    abdomen a) · brazos (bíceps a, tríceps a, martillo a, tríceps sobre cabeza a, abdomen a)
- **Candidatos por hueco y equipo** (ids del catálogo, en orden de preferencia; los días A/B/C toman el 1.º, 2.º, 3.º
  disponible para variar):

| Hueco                | machines                                                  | full                                                               | dumbbells                                      |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| press horizontal     | chest-press, smith-bench, pec-deck                        | dumbbell-bench, chest-press, smith-bench                           | dumbbell-bench, pushup, dumbbell-fly           |
| press inclinado      | machine-incline-press, smith-incline, cable-crossover     | incline-dumbbell, machine-incline-press, smith-incline             | incline-dumbbell, incline-pushup, dumbbell-fly |
| aperturas            | pec-deck, cable-crossover, low-cable-crossover            | pec-deck, dumbbell-fly, cable-crossover                            | dumbbell-fly, dumbbell-pullover, pushup        |
| jalón                | lat-pulldown, close-grip-pulldown, underhand-pulldown     | lat-pulldown, assisted-pullup, chin-up                             | dumbbell-pullover, one-arm-row, chin-up        |
| remo                 | seated-row, cable-row, high-row                           | seated-row, one-arm-row, cable-row                                 | one-arm-row, bent-over-db-row                  |
| espalda accesorio    | straight-arm-pulldown, high-row, back-extension           | straight-arm-pulldown, smith-row, back-extension                   | dumbbell-pullover, bent-over-db-row            |
| press hombro         | shoulder-press, smith-shoulder-press                      | dumbbell-shoulder-press, shoulder-press, arnold-press              | dumbbell-shoulder-press, arnold-press          |
| laterales            | cable-lateral-raise, lateral-raise                        | lateral-raise, cable-lateral-raise                                 | lateral-raise, front-raise                     |
| deltoide posterior   | reverse-machine-fly, face-pull                            | face-pull, rear-delt-fly-db, reverse-machine-fly                   | rear-delt-fly-db                               |
| tríceps              | tricep-pushdown, rope-pushdown, machine-triceps-extension | tricep-pushdown, dip-machine, rope-pushdown                        | bench-dips, kickback, lying-db-extension       |
| tríceps sobre cabeza | overhead-rope-extension, machine-triceps-extension        | overhead-rope-extension, db-overhead-extension, lying-db-extension | db-overhead-extension, lying-db-extension      |
| bíceps               | machine-curl, cable-curl, preacher-curl                   | bicep-curl, machine-curl, cable-curl                               | bicep-curl, incline-curl, concentration-curl   |
| martillo             | rope-hammer-curl, cable-curl                              | hammer-curl, rope-hammer-curl                                      | hammer-curl, zottman-curl                      |
| sentadilla/prensa    | leg-press, hack-squat, smith-squat                        | leg-press, hack-squat, smith-squat, dumbbell-squat                 | dumbbell-squat, bodyweight-squat, plie-squat   |
| bisagra              | smith-rdl, back-extension, pull-through                   | db-rdl, smith-rdl, pull-through                                    | db-rdl, single-glute-bridge                    |
| cuádriceps           | leg-extension, single-leg-extension                       | leg-extension, split-squat, lunges                                 | split-squat, lunges, step-ups                  |
| femoral              | leg-curl, lying-leg-curl, standing-leg-curl               | leg-curl, lying-leg-curl, db-rdl                                   | db-rdl, single-glute-bridge                    |
| glúteo               | hip-thrust, hip-abductor, cable-kickback                  | hip-thrust, cable-kickback, rear-lunge                             | hip-thrust, single-glute-bridge, rear-lunge    |
| gemelos              | calf-raise, seated-calf, leg-press-calf                   | calf-raise, seated-calf, smith-calf                                | db-calf, calf-raise                            |
| abdomen              | ab-crunch, cable-crunch, pallof-press                     | ab-crunch, cable-crunch, hanging-leg-raise                         | plank, dead-bug, bicycle-crunch, russian-twist |

- **Exclusiones por limitación** (conservadoras; si un hueco se queda sin candidato se omite):
  - rodillas: lunges, rear-lunge, split-squat, smith-split-squat, step-ups, hack-squat, smith-squat, dumbbell-squat, bodyweight-squat, plie-squat
  - hombros: shoulder-press, dumbbell-shoulder-press, arnold-press, smith-shoulder-press, upright-row-cable, dip-machine, bench-dips, front-raise
  - espalda baja: db-rdl, smith-rdl, bent-over-db-row, smith-row, back-extension, smith-squat, dumbbell-squat, plie-squat, russian-twist, woodchop
  - muñecas y codos: pushup, incline-pushup, bench-dips, lying-db-extension, close-grip-smith, reverse-curl, zottman-curl, kickback
- Nunca se repite un ejercicio dentro de un día; si el candidato ya está, se toma el siguiente.
- **Volumen** (`series × reps mín–máx / descanso`): músculo → básico 3 × 6–10 / 120, accesorio 3 × 8–12 / 90; fuerza →
  básico 4 × 4–6 / 150, accesorio 3 × 6–8 / 90; perder grasa y mantenerme → básico 3 × 10–15 / 60, accesorio 3 × 12–15 / 60.
  Principiante: accesorios con 2 series y, en fuerza, básicos 3 × 5–8 / 120. Avanzado: básicos +1 serie (máximo 5).
- **Nombres y etiquetas**: Cuerpo completo A/B/C (`FULL BODY`), Torso A/B (`TORSO`), Pierna A/B (`PIERNA`), Empuje
  (`PUSH DAY`), Tirón (`PULL DAY`), Pierna (`LEG DAY`), Pecho/Espalda/Hombros/Brazos (`PECHO`…), Descanso (`REST DAY`,
  `isRest`). Subtítulo «Día N · Torso / Pierna». Ids con `uid()`.
- **Títulos y «por qué»**: fullbody «Cuerpo completo · N días» / «Cada músculo dos o tres veces por semana: lo que más
  rinde con N días.»; upperlower «Torso / Pierna · N días» / «Torso y pierna en días alternos: buen reparto de trabajo y
  descanso.»; ppl «Empuje / Tirón / Pierna · N días» / 6 días «Cada grupo dos veces por semana, el clásico de seis
  días.» y 3 días «Cada grupo una vez por semana en sesiones cortas y enfocadas.»; pplul «Empuje / Tirón / Pierna +
  Torso / Pierna · 5 días» / «Cinco días: los tres clásicos más un torso y una pierna extra.»; pplfull «Empuje / Tirón /
  Pierna + Cuerpo completo · 4 días» / «Tres días enfocados y uno de repaso general.»; bodypart «Un grupo por día · 5
  días» / «Pecho, espalda, pierna, hombros y brazos: sesiones enfocadas, muy usado en gimnasios de máquinas.»; la de
  un día menos añade « Por si alguna semana no llegas a todos.» al «por qué».

## 5. Estados vacíos

- `nextRoutine` puede ser `null`. Hoy sin días: hero «Aún no tienes rutina» («Arma tu ciclo en dos minutos o crea un
  día desde cero.») con **Armar mi ciclo** (principal) y «Crear un día desde cero» (enlace); sin carrusel de ciclo;
  los recuadros de la semana se mantienen. Entrenar sin días: la misma tarjeta en lugar de la lista. Progreso y Perfil
  ya toleran cero entrenamientos. Las sugerencias del día flexible y «Marcar descanso» no se ofrecen sin días.

## 6. Perfil y privacidad

- En Perfil, la tarjeta de objetivo y días suma chips de experiencia, minutos, equipo y limitaciones (mismos textos que
  el cuestionario), opcionales.
- `/privacidad`, en «Qué guardamos»: «Si respondes el cuestionario de arranque: tu experiencia, minutos por sesión,
  equipo y, si las indicas, limitaciones físicas (dato de salud, opcional). Se borran con la cuenta.»

## 7. Pruebas

- `scripts/check-planner.cjs` (`npm run test:planner`, en `verify` y en CI): para cada `daysPerWeek` 2–6 × `kit` ×
  (sin limitación y cada limitación) × objetivo × experiencia: `proposals` devuelve 2 o 3; cada `week` tiene 7 rutinas,
  `daysPerWeek` de entrenamiento según `weekPattern`; todos los ids existen en el catálogo; ninguno excluido; sin
  repetidos dentro de un día; entre 4 y 8 ejercicios por día de entrenamiento; volumen de los básicos según objetivo;
  `exerciseBudget` por casos (30 min → 4; principiante 60 → 5; avanzado 75 → 8); `estimateMinutes` entre 20 y 100;
  la propuesta «un día menos» existe cuando días > 2 y no cuando días = 2; los días A y B de torso difieren en al
  menos un ejercicio con kit `machines`.
- `check-metrics.cjs`: `safeParse` con `setup`, los campos nuevos válidos e inválidos y `routines: []`.
- `check-cycles.mjs`: `removeCycleDay` deja el ciclo vacío.
- Playwright (`te-check.py`): cuenta nueva → nombre → «Propónme una» → 6 respuestas → 2–3 propuestas → vista previa →
  «Usar este ciclo» → Hoy saluda por el nombre y Entrenar muestra 7 días; cuenta nueva → «Ya tengo rutina» → 2 días →
  elegir ejercicios → crear → 7 días con 2 de entrenamiento; cuenta nueva → ejemplo → 5 días; cuenta nueva → «Más
  tarde» → Hoy vacío → «Armar mi ciclo» relanza; cuenta existente (sin `setup`) no ve el arranque; relanzar desde
  Entrenar con «Añadir al final»; Perfil muestra los campos nuevos. Capturas 390×844, 844×390, 1280×800, claro y oscuro;
  auditoría axe y objetivos.
- La CI pasa a ejecutar `npm run verify` (hoy omite `test:session`).

## 8. Riesgos

- Las exclusiones por limitación son conservadoras y generales; el texto fijo lo dice y nunca se bloquea editar.
- Un ciclo vacío es un estado nuevo: todos los lugares que leían `routines[0]` llevan guarda.
