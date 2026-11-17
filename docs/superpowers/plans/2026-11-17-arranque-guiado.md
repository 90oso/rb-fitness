# Arranque guiado · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cuentas nuevas pasan por un arranque guiado (nombre → ¿ya tienes rutina? → asistente / propuestas por reglas / ejemplo); el ciclo puede quedar vacío y la app lo muestra bien; el flujo se puede relanzar.

**Architecture:** Las reglas (`lib/planner.ts`) son puras y se prueban en Node; el flujo (`components/setup/`) es una máquina de pasos con estado local que solo escribe al final mediante un callback de `rb-app.tsx`; los estados vacíos son guardas en el orquestador y dos tarjetas de vista.

**Tech Stack:** Next.js 16, React 19 (React Compiler: sin `useMemo` manual, sin refs en render, sin `setState` síncrono en efectos), TypeScript, CSS plano (`glass.css` manda), pruebas con `node` + `node:assert`, Playwright para capturas.

**Spec:** `docs/superpowers/specs/2026-11-17-arranque-guiado-design.md`

## Global Constraints

- Textos en español con tilde y «comillas»; copy exacto donde el spec lo fija (§3, §4 «Títulos y por qué», §5).
- Objetivos táctiles ≥ 44 px; `prefers-reduced-motion`; contraste revisado en claro y oscuro.
- Sin dependencias nuevas.
- Ids del catálogo exactamente como en la tabla del spec §4; volumen según §4.
- `npm run verify` en verde antes de cada commit; commits con el formato del repo.
- Versión final 0.11.0 con entrada en `CHANGELOG.md`.

## Review Focus

1. Cuenta existente sin `setup` y con datos: nunca ve el arranque, ni tras recargar → prueba Playwright en Tarea 9.
2. Ciclo vacío por «Más tarde» o por quitar el último día: Hoy, Entrenar, día flexible y «Marcar descanso» no fallan → pruebas en Tareas 2 (`removeCycleDay`) y 7 (Playwright: quitar todos los días).
3. Limitación que deja un hueco sin candidato (p. ej. rodillas + dumbbells en «sentadilla/prensa»): el hueco se omite y el día sigue con ≥ 4 ejercicios → prueba en Tarea 3.
4. Relanzar con sesión activa: «Reemplazar» no se ofrece; «Añadir al final» sí → prueba Playwright en Tarea 8.
5. Cuestionario respondido pero «Usar este ciclo» no pulsado (cierra el flujo): no se guarda nada en el perfil → prueba Playwright en Tarea 9.

---

### Task 1: Tipos, `initialData` y `safeParse`

**Files:**

- Modify: `lib/types.ts`, `lib/catalog.ts` (`initialData`), `lib/storage.ts`, `scripts/check-metrics.cjs`

**Interfaces:**

- Produces: `Experience`, `SessionMinutes`, `GymKit`, `Limitation` exportados de `lib/types.ts`; `Profile.experience?`, `sessionMinutes?`, `kit?`, `limitations?`; `AppData.setup?: 'pending' | 'done'`; `initialData` con `routines: []`, `cycleIndex: 0`, `setup: 'pending'`; `defaultRoutines` sigue exportado.

- [ ] **Step 1: Casos en `check-metrics.cjs`** junto a los de 0.9.0:

```js
// setup:'pending' y 'done' se conservan; setup:'later' → undefined.
// profile.experience:'beginner', sessionMinutes:45, kit:'machines', limitations:['knees','wrists'] se conservan;
// experience:'pro' → undefined; sessionMinutes:50 → undefined; limitations:['knees','neck'] → ['knees'] (se filtra lo inválido).
// routines: [] con cycleIndex 0 se acepta.
// initialData.routines.length === 0 && initialData.setup === 'pending'; defaultRoutines.length === 5.
```

Ejecutar `npm run test:metrics` → falla.

- [ ] **Step 2: `lib/types.ts`** — añadir los cuatro tipos y los campos opcionales con comentarios del spec §2.
- [ ] **Step 3: `lib/catalog.ts`** — `initialData`: `routines: []`, `cycleIndex: 0`, `setup: 'pending'`. Revisar usos de `initialData.routines` (`grep -rn "initialData" components hooks lib scripts`) y ajustar los que supongan días.
- [ ] **Step 4: `lib/storage.ts`** — en `safeParse`: permitir `routines.length === 0` (y `cycleIndex` 0 en ese caso); copiar `setup` solo si es `'pending' | 'done'`; copiar `experience`/`sessionMinutes`/`kit` solo con valor permitido; `limitations` filtrado a los cuatro valores (array vacío → se omite).
- [ ] **Step 5: `npm run test:metrics && npm run typecheck`** → OK. Commit: `feat(datos): campos del arranque guiado y ciclo vacío`.

---

### Task 2: El ciclo puede quedar vacío

**Files:**

- Modify: `lib/cycles.ts:38-50` (`removeCycleDay`), `scripts/check-cycles.mjs`, `components/rb-app.tsx` (`nextRoutine`, `markRest`, `onSkipTo`, día flexible), `components/views/today-view.tsx`, `components/views/train-view.tsx`

**Interfaces:**

- Produces: `removeCycleDay` ya no lanza «El ciclo necesita al menos un día»; `nextRoutine: Routine | null` en `rb-app`; `TodayView` acepta `nextRoutine: Routine | null` y props nuevas `onSetup: () => void`, `onNewDay: () => void`; `TrainView` acepta `onSetup`. Componente `EmptyCycle` en `components/ui/empty-cycle.tsx` con props `{ onSetup, onNewDay, compact?: boolean }`.

- [ ] **Step 1: `check-cycles.mjs`** — caso nuevo: quitar el único día deja `routines: []` y `cycleIndex: 0`; quitar con sesión activa sigue lanzando. Ejecutar `npm run test:cycles` → falla.
- [ ] **Step 2: `removeCycleDay`** — quitar la guarda de «al menos un día»; `cycleIndex: Math.max(0, …)`.
- [ ] **Step 3: `EmptyCycle`** — tarjeta con icono, «Aún no tienes rutina», «Arma tu ciclo en dos minutos o crea un día desde cero.», botón `lime-btn` **Armar mi ciclo** y `text-link` **Crear un día desde cero**. `compact` quita el párrafo (para Entrenar en horizontal).
- [ ] **Step 4: `rb-app.tsx`** — `const nextRoutine = routines.length ? (routines[data.cycleIndex % routines.length] ?? routines[0]) : null`; `markRest`, `onSkipTo`, sugerencias del día flexible y «Continuar»/«Empezar» de Hoy con guarda `if (!nextRoutine) return`. `onSetup` abre el flujo (Tarea 6; de momento `() => {}` con TODO que la Tarea 6 quita).
- [ ] **Step 5: `TodayView`** — si `nextRoutine === null`: sustituye hero y carrusel por `<EmptyCycle/>`; la marca de fondo `.hoy-mark` no se muestra; los recuadros de la semana siguen.
- [ ] **Step 6: `TrainView`** — si `data.routines.length === 0`: `<EmptyCycle/>` en lugar de la lista; la barra con «Nuevo día» sigue.
- [ ] **Step 7: Estilos** `.empty-cycle` en `glass.css` (panel cristal, centrado, botón ≥ 48 px).
- [ ] **Step 8: Comprobar** con Playwright: cuenta con 1 día → quitarlo → Hoy y Entrenar vacíos sin errores de consola; «Marcar descanso» no aparece. `npm run verify` → OK. Commit: `feat(ciclo): el ciclo puede quedar vacío y la app lo muestra`.

---

### Task 3: Motor de propuestas (`lib/planner.ts`)

**Files:**

- Create: `lib/planner.ts`, `scripts/check-planner.cjs`
- Modify: `package.json` (`test:planner`, en `verify`), `.github/workflows/ci.yml` (sustituir la lista de pruebas por `npm run verify`)

**Interfaces:**

- Produces (spec §4): `weekPattern`, `splitsFor`, `volumeFor`, `exerciseBudget`, `excludedBy`, `buildWeek`, `estimateMinutes`, `proposals`, tipos `PlannerInput`, `Split`, `Proposal`; además `export const SPLIT_LABEL: Record<Split, string>` y `export const DAY_LETTERS = ['L','M','X','J','V','S','D']`.

- [ ] **Step 1: `scripts/check-planner.cjs`** (hook de transpilación como `check-session.cjs`):

```js
// weekPattern(3) → [T,F,T,F,T,F,F]; weekPattern(5) → [T,T,T,T,T,F,F]; weekPattern(2) → [T,F,F,T,F,F,F].
// splitsFor: 2 → ['fullbody']; 3 → ['fullbody','ppl']; 4 → ['upperlower','pplfull']; 5 → ['pplul','bodypart']; 6 → ['ppl','upperlower'].
// volumeFor('muscle','intermediate','compound') → {3,6,10,120}; ('strength','beginner','compound') → {3,5,8,120};
//   ('loss','beginner','accessory') → {2,12,15,60}; ('muscle','advanced','compound') → {4,6,10,120}; ('strength','advanced','compound') → {5,4,6,150}.
// exerciseBudget('beginner',60) → 5; ('intermediate',30) → 4; ('advanced',75) → 8; ('intermediate',45) → 5.
// excludedBy(['knees']) contiene 'lunges' y no 'leg-press'; excludedBy([]) vacío.
// Para days 2..6 × kit × [[],['knees'],['shoulders'],['lowerBack'],['wrists']] × goal × experience (bucle):
//   const list = proposals(input, uid); 2 ≤ list.length ≤ 3; list[0].daysPerWeek === days; (days>2) === list.some(p => p.daysPerWeek === days-1);
//   cada p.week: length 7; días con !isRest === p.daysPerWeek y en las posiciones de weekPattern(p.daysPerWeek);
//   cada día de entrenamiento: 4 ≤ exercises.length ≤ 8; ids únicos; todos en catalog; ninguno en excludedBy;
//   exercises[0] (básico) cumple volumeFor(goal, experience, 'compound'); 20 ≤ p.minutes ≤ 100.
// buildWeek('upperlower', {kit:'machines',…}) → Torso A y Torso B difieren en ≥ 1 exerciseId; nombres 'Torso A','Pierna A','Descanso','Torso B','Pierna B','Descanso','Descanso'.
// Limitación rodillas + dumbbells, fullbody A: no hay sentadilla/prensa y el día tiene ≥ 4 ejercicios.
```

- [ ] **Step 2: `package.json`** — `"test:planner": "node scripts/check-planner.cjs"` al final de `verify`; `ci.yml`: los pasos `lint`, `format:check`, `test:*`, `typecheck` se sustituyen por `npm run verify` (y `build` queda). Ejecutar `npm run test:planner` → falla.
- [ ] **Step 3: Implementar `lib/planner.ts`** con las tablas del spec §4 (`SLOTS`, `DAY_TEMPLATES`, `EXCLUDED`, `VOLUME`), `pickExercise(slot, kit, variant, excluded, used)` (candidato `variant`-ésimo disponible, saltando excluidos y usados; `null` si no queda), `buildDay(template, variant, input, uid)`, `buildWeek` (coloca los templates del split sobre `weekPattern` en orden; descansos con `defaultCycleDay(uid(), true)` renombrados «Descanso»/«REST DAY»), `proposals` (ids `p1`, `p2`, `p3`).
- [ ] **Step 4: `npm run test:planner`** → `OK: N pruebas del planificador`. `npm run verify` → OK. Commit: `feat(planner): propuestas de ciclo por reglas con pruebas`.

---

### Task 4: Selector con músculos preseleccionados y volumen por defecto

**Files:**

- Modify: `components/modals/exercise-picker.tsx` (prop `preset?: Muscle[]`), `components/modals/exercise-picker-modal.tsx` (pasa `preset`)

**Interfaces:**

- Produces: con `preset` de ≥ 1 músculo, el filtro inicial es «Elegidos» (chip extra al principio que muestra solo esos músculos); los demás chips siguen disponibles.

- [ ] **Step 1: Prueba** (se cubre en `te-check.py`, Tarea 9: el selector abierto desde el asistente con «Pecho, Tríceps» muestra solo grupos de esos músculos y el chip «Elegidos» activo). Anotar el caso ahora en el guion.
- [ ] **Step 2: Implementar** — estado `muscle: 'Todos' | 'Elegidos' | Muscle` con inicial `'Elegidos'` si `preset?.length`; filtro: `'Elegidos'` → `preset.includes(exercise.muscle)`.
- [ ] **Step 3: `npm run typecheck && npm run lint`** → OK. Commit: `feat(selector): filtro inicial por músculos elegidos`.

---

### Task 5: Pantallas del flujo (`components/setup/`)

**Files:**

- Create: `components/setup/setup-flow.tsx` (máquina de pasos), `components/setup/steps.tsx` (NameStep, ChoiceStep, Questionnaire, ProposalsStep, ProposalPreview, WeekStrip, ChoiceChips), `components/setup/own-routine-wizard.tsx`
- Modify: `app/glass.css` (`.setup-*`)

**Interfaces:**

- Consumes: `proposals`, `weekPattern`, `volumeFor`, `estimateMinutes`, `SPLIT_LABEL`, `DAY_LETTERS` (Tarea 3); `ExercisePickerModal` con `preset` (Tarea 4); `defaultRoutines`; `defaultCycleDay`; `uid`.
- Produces:

```ts
// setup-flow.tsx
export interface SetupResult {
  name?: string;
  profile: Partial<Profile>;
  routines: Routine[];
}
export default function SetupFlow(props: {
  mode: 'first' | 'relaunch'; // 'first' pide nombre y ofrece «Más tarde»; 'relaunch' empieza en la pregunta 1 y ofrece «Cancelar»
  profile: Profile;
  onFinish: (result: SetupResult) => void;
  onLater: (name?: string) => void; // solo en 'first'
  onCancel: () => void; // solo en 'relaunch'
  onOpenDetail: (exerciseId: string) => void;
}): JSX.Element;
```

- [ ] **Step 1: Esqueleto** — `SetupFlow` con `step` en estado: `'name' | 'choice' | 'own' | 'quiz' | 'proposals' | 'preview'`; cabecera con atrás, puntos de progreso y «Más tarde»/«Cancelar»; contenedor `.setup-screen > .setup-card` sobre `AuthFrame`-like (fondo de malla ya global).
- [ ] **Step 2: `NameStep`** — campo con `autoFocus` solo con `(pointer: fine)`, máx. 30 caracteres, «Continuar» deshabilitado vacío.
- [ ] **Step 3: `ChoiceStep`** — tres tarjetas-botón con título y línea pequeña (copy spec §3.1).
- [ ] **Step 4: `Questionnaire`** — seis pantallas con `ChoiceChips` (una elección, salvo limitaciones: varias con «Ninguna» excluyente); valores iniciales desde `profile` (objetivo, días, y los nuevos si existen); al terminar llama `proposals()`.
- [ ] **Step 5: `ProposalsStep`** — tarjetas con `title`, `why`, `WeekStrip` (7 celdas L–D con etiqueta corta: `TORSO`, `PIERNA`, `PUSH`, `PULL`, `FULL`, `PECHO`…, `·` para descanso) y «≈ N min por sesión» (media de los días de entrenamiento); nota fija al pie (copy spec §3.3).
- [ ] **Step 6: `ProposalPreview`** — los 7 días; cada entrenamiento con sus ejercicios (`ExercisePhoto` 56×38, nombre, «3 × 8–12 · 90 s»); botón **Usar este ciclo**.
- [ ] **Step 7: `OwnRoutineWizard`** — días (2–6) → por día: nombre, chips de músculos (los 10 del catálogo), botón **Elegir ejercicios** (abre `ExercisePickerModal` con `preset`), lista de elegidos con quitar; «Siguiente día»; resumen `WeekStrip` + «Crear mi ciclo». Construye 7 rutinas con `weekPattern` y descansos; ejercicios con `volumeFor(goal, experience ?? 'intermediate', 'accessory')`.
- [ ] **Step 8: Estilos** — `.setup-card` máx. 560 px, chips ≥ 48 px, tarjetas de propuesta, `WeekStrip`, vista previa; vertical ≤ 600 px a pantalla completa; horizontal en dos columnas donde quepa.
- [ ] **Step 9: `npm run typecheck && npm run lint`** → OK (el flujo aún no se monta). Commit: `feat(arranque): pantallas del flujo guiado`.

---

### Task 6: Montaje en la app, guardado y relanzar

**Files:**

- Modify: `components/rb-app.tsx`, `components/views/train-view.tsx` (botón «Armar un ciclo nuevo»), `components/ui/empty-cycle.tsx` (ya llama `onSetup`)

**Interfaces:**

- Consumes: `SetupFlow` (Tarea 5), `choose` (useConfirm), `addCycleDay`.
- Produces en `rb-app`: estado `setupOpen: boolean`; `showFirstSetup = data.setup === 'pending' && !setupDismissed`; `applySetup(result, mode: 'replace' | 'append')`.

- [ ] **Step 1: Montaje** — tras la carga, si `data.setup === 'pending'` renderizar `<SetupFlow mode="first" …/>` en lugar de la app (antes de `app-root`); si `setupOpen`, `<SetupFlow mode="relaunch" …/>` como pantalla completa por encima.
- [ ] **Step 2: `applySetup`** — `setData`: perfil con `name` (si viene) y campos del cuestionario; rutinas: `replace` → `routines: result.routines, cycleIndex: 0`; `append` → `addCycleDay` en bucle; `setup: 'done'`; cierra el flujo; toast «Tu ciclo está listo».
- [ ] **Step 3: `onLater`** — perfil con nombre si lo escribió; `setup: 'done'`; rutinas quedan `[]`.
- [ ] **Step 4: Relanzar** — `onFinish` en `relaunch` con `routines.length > 0`: `choose({ title: '¿Qué hacemos con tu ciclo actual?', message: 'Puedes reemplazarlo por el nuevo o añadir estos días al final.', confirmLabel: 'Reemplazar', cancelLabel: 'Añadir al final' })`; `null` → seguir en el flujo; con `data.active` → sin `choose`, directamente `append` y toast «Con una sesión activa solo se puede añadir al final.».
- [ ] **Step 5: Entrenar** — botón `secondary-btn` «Armar un ciclo nuevo» en `.cycle-toolbar`; `EmptyCycle.onSetup` → `setSetupOpen(true)`.
- [ ] **Step 6: Comprobar** manualmente los tres caminos en 390 px. `npm run verify` → OK. Commit: `feat(arranque): montaje, guardado y relanzar desde Entrenar`.

---

### Task 7: Perfil y privacidad

**Files:**

- Modify: `components/views/profile-view.tsx`, `app/privacidad/page.tsx`

- [ ] **Step 1: Perfil** — en la tarjeta de objetivo/días, filas de chips: Experiencia (3), Minutos por sesión (4), Equipo (3), Limitaciones (varias + «Ninguna»); `onProfileChange` con el campo; textos iguales al cuestionario.
- [ ] **Step 2: Privacidad** — viñeta nueva en «Qué guardamos» (copy spec §6) y fecha de actualización.
- [ ] **Step 3: `npm run verify`** → OK. Commit: `feat(perfil): experiencia, minutos, equipo y limitaciones`.

---

### Task 8: Mock de desarrollo y guion Playwright

**Files:**

- Create: `scratchpad/te-check.py` (no se versiona)
- Modify: `scripts/dev/mock-supabase.mjs` solo si hace falta (las cuentas nuevas ya devuelven «sin fila» → `initialData`).

- [ ] **Step 1: Guion** con los casos del spec §7 (Playwright), incluidos los de Review Focus 1, 4 y 5 y el caso del selector con `preset` (Tarea 4). Ejecutar → RED donde aún falte.
- [ ] **Step 2: Corregir** lo que el guion saque. `npm run verify` → OK. Commit si hubo cambios: `fix(arranque): ajustes tras el guion de prueba`.

---

### Task 9: Capturas, auditoría, versión y PR

**Files:**

- Modify: `CHANGELOG.md`, `package.json`, `package-lock.json` (0.11.0)

- [ ] **Step 1: Capturas** 390×844 (claro y oscuro), 844×390 y 1280×800 de: nombre, elección, cuestionario, propuestas, vista previa, asistente, Hoy vacío, Entrenar vacío, Perfil.
- [ ] **Step 2: Auditoría** `audit.py` en 390×844 y 844×390 más una pasada manual de axe sobre las pantallas del flujo (no están en el guion de auditoría): sin violaciones ni objetivos < 44 px.
- [ ] **Step 3: CHANGELOG `[0.11.0]`** — Añadido: arranque guiado (tres caminos), motor de propuestas, campos de perfil, relanzar, estados vacíos; Cambiado: la CI ejecuta `verify`; cuentas nuevas empiezan sin ciclo hasta elegir.
- [ ] **Step 4: `npm run verify` && `next build`**; commit `chore: versión 0.11.0`; push; revisión independiente de la rama; corregir importantes; PR contra `main` con el cuerpo del repo; reportar CI en verde y enviar capturas.
