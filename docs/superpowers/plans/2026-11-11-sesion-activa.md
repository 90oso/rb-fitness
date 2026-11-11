# Sesión activa (entrega A) · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Descanso fijo, ajustable y con aviso; avance automático al completar un ejercicio; teléfono en horizontal con formato de teléfono; sustituir/quitar/añadir ejercicios en sesión con guardado opcional en la rutina; aviso visible de «toca subir de peso».

**Architecture:** Las reglas puras van a `lib/session.ts` (probado con Node, sin React). El temporizador, el aviso y el wake lock son hooks independientes que `rb-app.tsx` orquesta; la vista de sesión solo recibe props. La sesión trabaja sobre una copia de los ejercicios (`active.exercises`) y la rutina solo cambia al finalizar si el usuario lo pide.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS plano (`app/glass.css` manda sobre `app/globals.css`), pruebas con `node --experimental-strip-types` + `node:assert`, Playwright para capturas.

**Spec:** `docs/superpowers/specs/2026-11-11-sesion-activa-design.md`

## Global Constraints

- Textos de interfaz en español, con tilde y «comillas»; copy exacto donde el spec lo fija.
- Objetivos táctiles ≥ 44 px; `prefers-reduced-motion` desactiva animaciones; contraste verificado en claro y oscuro.
- Sin dependencias nuevas. El sonido es un archivo propio en `public/sounds/descanso.mp3`.
- Regla de teléfono: `(max-width: 800px), (max-height: 500px)`; densidad: `(max-width: 600px), (max-height: 500px)`; escritorio: `(min-width: 801px) and (min-height: 501px)`.
- Descanso acotado a 0–1800 s. Incremento de progresión sin cambios (`progressionAdvice`).
- Commits con el formato del repo; `npm run verify` en verde antes de cada commit que toque TS/CSS.
- Versión final 0.9.0 con entrada en `CHANGELOG.md`.

## Review Focus

1. Sesión abierta desde 0.8.x (sin `active.exercises`): la vista usa la rutina y al finalizar no se pregunta nada → prueba en Tarea 2 (`sessionExercises` sin copia) y Tarea 2 (`sessionDiffersFromRoutine` con rutina ausente).
2. La rutina de la sesión fue borrada del ciclo mientras se entrenaba: `routine` es `undefined`; la sesión debe seguir con su copia y finalizar sin diálogo → prueba en Tarea 2.
3. Registro de descanso de otra sesión u otra cuenta en `localStorage`: se ignora → prueba en Tarea 2 (`parseRestRecord`).
4. «−15 s» cuando quedan menos de 15 s: el descanso termina sin sonar (equivale a Omitir) → prueba en Tarea 5 (`useRestTimer.adjust`).
5. Quitar el ejercicio seleccionado que tiene series: se borran sus series y la selección pasa al siguiente pendiente o al primero → prueba en Tarea 2 (`nextPendingExercise` con `currentId` ausente) y comprobación manual en Tarea 8.

---

### Task 1: Regla de teléfono y formato horizontal (A4)

**Files:**

- Create: `lib/layout.ts`
- Modify: `hooks/use-hide-on-scroll.ts:12`, `app/globals.css` (bloques `@media (max-width: 800px)`, `(max-width: 600px)`), `app/glass.css` (bloques `(max-width: 800px)`, `(max-width: 600px)`, `(min-width: 801px)`, `(pointer: coarse), (max-width: 800px)`)
- Test: `scratchpad` script Playwright `land-check.py` (no se versiona)

**Interfaces:**

- Produces: `export const PHONE_QUERY = '(max-width: 800px), (max-height: 500px)';` en `lib/layout.ts`.

- [ ] **Step 1: Escribir la comprobación** — script Playwright que abre la app (mock Supabase, `next start -p 3100`) en 844×390 y 1280×800 y evalúa `getComputedStyle(document.querySelector('.sidebar')).display` y `getComputedStyle(document.querySelector('.bottom-nav')).display`.

Esperado antes del cambio: 844×390 → sidebar `flex`/`block`, nav `none` (fallo).

- [ ] **Step 2: Crear `lib/layout.ts`** con `PHONE_QUERY` y un comentario: «Si cambias esto, cambia las consultas de medios de `app/globals.css` y `app/glass.css`».

- [ ] **Step 3: `useHideOnScroll`** — reemplazar la constante `MOBILE` por `PHONE_QUERY` importada.

- [ ] **Step 4: CSS** — con `sed` o a mano: `(max-width: 800px)` → `(max-width: 800px), (max-height: 500px)`; `(max-width: 600px)` → `(max-width: 600px), (max-height: 500px)`; `(min-width: 801px)` → `(min-width: 801px) and (min-height: 501px)`; `(pointer: coarse), (max-width: 800px)` → `(pointer: coarse), (max-width: 800px), (max-height: 500px)`. Comentario junto a la primera aparición en cada archivo apuntando a `lib/layout.ts`.

- [ ] **Step 5: Bloque horizontal** al final de `app/glass.css`, antes de `/* ---- Movimiento y transparencia reducidos`:

```css
/* Teléfono en horizontal: mismas piezas que en vertical, dos columnas solo donde caben. */
@media (max-height: 500px) and (orientation: landscape) {
  .active-layout {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 16px;
  }
  .hoy {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 16px 18px;
    align-items: start;
  }
  .routine-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 6: Ejecutar la comprobación** — `next build` + script. Esperado: 844×390 → sidebar `none`, nav visible; 1280×800 → sidebar visible, nav `none`. Capturas `land-*.png` de Hoy, Entrenar, sesión (dos columnas).

- [ ] **Step 7: `npm run verify`** → todo OK. Commit: `feat(ui): el teléfono en horizontal conserva el formato de teléfono`.

---

### Task 2: Reglas puras de la sesión (`lib/session.ts`)

**Files:**

- Create: `lib/session.ts`, `scripts/check-session.mjs`
- Modify: `package.json` (`test:session`, añadido a `verify`)

**Interfaces:**

- Consumes: `progressionAdvice` de `lib/metrics.ts`; tipos de `lib/types.ts` (Task 3 añade `ActiveWorkout.exercises?`; mientras tanto, tipar el parámetro como `{ exercises?: RoutineExercise[] }`).
- Produces (todas exportadas, sin React):

```ts
export function sessionExercises(
  active: { exercises?: RoutineExercise[] },
  routine: Routine | undefined
): RoutineExercise[];
export function exerciseProgress(
  sets: SetEntry[],
  rx: RoutineExercise
): { done: number; target: number; complete: boolean };
export function nextPendingExercise(
  exercises: RoutineExercise[],
  sets: SetEntry[],
  currentId: string
): string | null;
export function adjustRest(
  exercises: RoutineExercise[],
  exerciseId: string,
  deltaSeconds: number
): RoutineExercise[]; // restSeconds acotado a 0–1800, sin mutar
export function sessionDiffersFromRoutine(
  session: RoutineExercise[],
  routine: RoutineExercise[] | undefined
): boolean; // false si routine es undefined
export function raiseCount(workouts: Workout[], exercises: RoutineExercise[]): number;
export const REST_KEY = 'rb-rest';
export interface RestRecord {
  activeId: string;
  exerciseId: string;
  endsAt: number;
}
export function parseRestRecord(raw: string | null, activeId: string, now: number): RestRecord | null; // null si JSON inválido, activeId distinto o endsAt <= now
```

- [ ] **Step 1: Escribir `scripts/check-session.mjs`** (estilo `check-cycles.mjs`, importa `../lib/session.ts`), con estas pruebas:

```js
const rx = (id, rest = 90, target = 3) => ({
  exerciseId: id,
  targetSets: target,
  minReps: 8,
  maxReps: 12,
  restSeconds: rest,
});
const set = (id, reps = 12, weight = 20) => ({
  id: `${id}-${reps}-${weight}`,
  exerciseId: id,
  reps,
  weight,
  performedAt: '2026-11-11T10:00:00.000Z',
});
// sessionExercises: devuelve la copia si existe; la rutina si no; [] si no hay ninguna.
// exerciseProgress: 2 series de 3 → {done:2,target:3,complete:false}; 4 de 3 → complete:true, done:4.
// nextPendingExercise([a,b,c], sets completan a, 'a') → 'b'; sets completan a y b → 'c'; sets completan a,b,c → null;
//   ([a,b,c], sets completan b y c, 'b') → 'a' (vuelve al principio); currentId 'zzz' ausente → primer pendiente.
// adjustRest: +15 sobre 90 → 105 solo en ese ejercicio; −120 sobre 90 → 0; +2000 → 1800; no muta la entrada.
// sessionDiffersFromRoutine: igual → false; otro orden → true; sustituido → true; descanso distinto → true;
//   uno añadido → true; uno quitado → true; routine undefined → false.
// raiseCount: workouts con 3×12 a 20 kg en 'a' y 2×12 en 'b' → 1 con [rx('a'), rx('b')].
// parseRestRecord: null → null; JSON inválido → null; activeId distinto → null; endsAt pasado → null; válido → objeto.
```

- [ ] **Step 2: Añadir a `package.json`** `"test:session": "node --no-warnings --experimental-strip-types scripts/check-session.mjs"` y encadenarlo al final de `verify`. Ejecutar `npm run test:session` → falla (módulo inexistente).

- [ ] **Step 3: Implementar `lib/session.ts`** con las firmas de arriba. `nextPendingExercise`: índice del actual (−1 si ausente); recorrer después del índice y luego desde 0 hasta el índice; pendiente = `!exerciseProgress(sets, rx).complete`. `sessionDiffersFromRoutine`: distinta longitud o algún índice con distinto `exerciseId`, `targetSets`, `minReps`, `maxReps` o `restSeconds`. `raiseCount`: cuenta `progressionAdvice(workouts, rx.exerciseId, rx.targetSets, rx.maxReps)?.kind === 'increase'`.

- [ ] **Step 4: `npm run test:session`** → `OK: N pruebas de sesión`. Commit: `feat(sesion): reglas puras de la sesión activa con pruebas`.

---

### Task 3: Modelo de datos y validación

**Files:**

- Modify: `lib/types.ts:66-79`, `lib/storage.ts:61-71,98-124`, `scripts/check-metrics.cjs` (casos de `safeParse`)

**Interfaces:**

- Produces: `ActiveWorkout.exercises?: RoutineExercise[]`; `Profile.restSound?: boolean`; `Profile.keepAwake?: boolean`; `safeParse` conserva los tres cuando son válidos y los descarta en silencio cuando no.

- [ ] **Step 1: Añadir casos a `check-metrics.cjs`** junto a los `safeParse` existentes:

```js
// active.exercises válido se conserva (includeActive=true); con un ejercicio inválido (restSeconds: -1) → active sin exercises;
// profile.restSound=false y keepAwake=false se conservan; restSound='no' → se descarta (undefined); sin ellos → undefined.
```

Ejecutar `npm run test:metrics` → falla.

- [ ] **Step 2: `lib/types.ts`** — añadir los tres campos opcionales con los comentarios del spec.

- [ ] **Step 3: `lib/storage.ts`** — extraer `validRx(rx: unknown): rx is RoutineExercise` del `every` de `validRoutine` y reutilizarlo; en `validActive` aceptar `exercises` ausente o array ≤ 100 que cumpla `validRx` (si no cumple, `safeParse` lo omite al construir `active`); en el perfil, copiar `restSound`/`keepAwake` solo si son `boolean`.

- [ ] **Step 4: `npm run test:metrics` && `npm run typecheck`** → OK. Commit: `feat(datos): copia de ejercicios en la sesión y ajustes de sesión en el perfil`.

---

### Task 4: Diálogo de tres salidas (`choose`)

**Files:**

- Modify: `components/ui/confirm-dialog.tsx`, `hooks/use-confirm.tsx`

**Interfaces:**

- Produces: `useConfirm()` devuelve `{ confirm, choose, dialog }` con `choose(options: ConfirmOptions): Promise<'confirm' | 'cancel' | null>` (null = X, Escape o fondo). `confirm()` sigue devolviendo `boolean` (cerrar = false). `ConfirmDialog.onClose(result: 'confirm' | 'cancel' | 'dismiss')`.

- [ ] **Step 1: `ConfirmDialog`** — `onClose` recibe `'confirm' | 'cancel' | 'dismiss'`: botón cancelar → `'cancel'`; X, Escape, fondo → `'dismiss'`; confirmar → `'confirm'`.
- [ ] **Step 2: `useConfirm`** — `Pending.resolve(result)`; `confirm` mapea `'confirm'` → true, resto false; `choose` mapea `'dismiss'` → null. Una llamada nueva resuelve la anterior como cancelada/`null`.
- [ ] **Step 3: `npm run typecheck && npm run lint`** → OK (ningún llamador cambia). Commit: `feat(ui): diálogo con tres salidas (choose)`.

---

### Task 5: Temporizador de descanso fijo y ajustable (A1)

**Files:**

- Create: `hooks/use-rest-timer.ts`, `components/session/rest-bar.tsx`
- Modify: `components/rb-app.tsx` (sustituye `restEnd`/`restRemainingMs`), `components/views/active-session-view.tsx` (quita el bloque `.rest-timer`, recibe `rest*`), `app/glass.css` (estilos `.rest-bar`), `app/globals.css` (borrar `.rest-timer*` 940-961)

**Interfaces:**

- Consumes: `REST_KEY`, `parseRestRecord`, `adjustRest` (Task 2).
- Produces:

```ts
export type RestPhase = 'idle' | 'running' | 'done';
export function useRestTimer(activeId: string | null, now: number, onDone: () => void): {
  phase: RestPhase; remainingMs: number; exerciseId: string | null;
  start(exerciseId: string, seconds: number): void; adjust(deltaSeconds: number): void; skip(): void; dismiss(): void;
};
// RestBar props
{ phase: 'running' | 'done'; remainingMs: number; setNumber: number; onAdjust(delta: number): void; onSkip(): void; onDismiss(): void }
```

- [ ] **Step 1: Hook** — estado `{ exerciseId, endsAt } | null`; `phase`: null → `idle`; `endsAt > now` → `running`; si no → `done`. `onDone` se llama una vez por `endsAt` (ref con el último avisado) cuando `phase` pasa a `done`. `skip`/`dismiss` → null. `adjust(d)`: `endsAt + d*1000`; si queda ≤ 0 → `skip()` (Review Focus 4). Persistencia: `localStorage[REST_KEY]` se escribe en `start`/`adjust`, se borra en `skip`/`dismiss` y cuando `activeId` es null; al montar o cambiar `activeId`, restaurar con `parseRestRecord`. Todo acceso a `localStorage` en `try/catch`.
- [ ] **Step 2: Prueba manual del hook** con una página de prueba temporal o en la app: guardar serie → corre; recargar → sigue; −15 con 10 s → desaparece sin sonar; +15 → suma.
- [ ] **Step 3: `RestBar`** — `role="status"`, `aria-live="polite"`. `running`: icono `Timer`, «Descanso», `mm:ss` (`prettyDuration`), botones «−15 s», «+15 s», «Omitir». `done`: clase `rest-bar-done`, texto «Descanso terminado · Serie {setNumber}», botón X «Cerrar aviso».
- [ ] **Step 4: Estilos** en `glass.css`: `.rest-bar` cristal (`--panel`, borde `--stroke`, blur), botones ≥ 44 px, `tabular-nums`; teléfono vertical `@media (max-width: 800px) and (min-height: 501px)` → `position: fixed; left:16px; right:16px; bottom: calc(12px + 58px + 10px + env(safe-area-inset-bottom, 0px)); z-index: 41`; resto → `position: sticky; top: calc(var(--topbar-h) + 8px); z-index: 5; margin-bottom: 14px`. `.rest-bar-done` fondo `rgb(var(--acid-rgb) / .18)`, borde ámbar, animación `rest-pulse` 3× 1 s; sin animación bajo `prefers-reduced-motion`. En el bloque ≤ 600 subir el scrim inferior `.app-root::after` para que cubra también la barra.
- [ ] **Step 5: Cableado en `rb-app.tsx`** — `const rest = useRestTimer(data.active?.id ?? null, now, fireAlert)` (`fireAlert` llega en Task 6; de momento `() => {}`); `saveSet` → `rest.start(selectedExercise, currentRx?.restSeconds ?? 90)`; `onRestAdjust(d)` → `rest.adjust(d)` y `setData` con `adjustRest(active.exercises ?? [], rest.exerciseId, d)` (solo si `active.exercises` existe); `finishWorkout`/`discardWorkout`/`signOut`/`deleteAccount` → `rest.dismiss()`; `selectExercise` → si `rest.phase === 'done'` → `rest.dismiss()`. La vista recibe `rest={{ phase, remainingMs }}`, `onRestAdjust`, `onRestSkip`, `onRestDismiss` y renderiza `<RestBar setNumber={setsForCurrent.length + 1} …/>` al inicio de `.log-card` cuando `phase !== 'idle'`.
- [ ] **Step 6: Capturas** 390×844 (barra sobre la navegación, no tapa «Guardar serie» tras hacer scroll), 844×390 y 1280×800 (pegajosa arriba). `npm run verify` → OK. Commit: `feat(sesion): temporizador de descanso fijo y ajustable`.

---

### Task 6: Aviso al terminar, pantalla encendida y ajustes en Perfil (A2)

**Files:**

- Create: `hooks/use-rest-alert.ts`, `hooks/use-wake-lock.ts`, `public/sounds/descanso.mp3`
- Modify: `components/rb-app.tsx`, `components/views/profile-view.tsx` (nueva tarjeta tras APARIENCIA), `app/glass.css` (si hace falta para `.switch-row` en Perfil)

**Interfaces:**

- Consumes: `Profile.restSound`, `Profile.keepAwake` (Task 3); `useRestTimer.onDone` (Task 5).
- Produces: `useRestAlert(soundEnabled: boolean): { unlock(): void; fire(): void }`; `useWakeLock(enabled: boolean): void`.

- [ ] **Step 1: Sonido** — generar con Python (`numpy`/`wave`) dos tonos (E5 659 Hz 0.35 s, A5 880 Hz 0.55 s, decaimiento exponencial, −6 dBFS) y convertir con `ffmpeg -i descanso.wav -codec:a libmp3lame -b:a 64k public/sounds/descanso.mp3`. Tamaño esperado < 20 KB. Añadir «Sonido de fin de descanso: propio, dominio público» a los créditos de `/privacidad` si esa página lista los recursos; si no, al CHANGELOG.
- [ ] **Step 2: `useRestAlert`** — `audioRef` creado en `unlock()` (`new Audio('/sounds/descanso.mp3')`, `preload='auto'`): `muted=true; play().then(pause, currentTime=0, muted=false)` dentro de `try/catch`. `fire()`: si `soundEnabled` → `play().catch(() => {})`; `navigator.vibrate?.([180, 90, 180])`; háptico iOS: `<label>` oculto con `<input type="checkbox">` + `setAttribute('switch','')` creado una vez en `document.body`, `label.click()` en `try/catch`.
- [ ] **Step 3: `useWakeLock`** — `useEffect` sobre `enabled`: si `navigator.wakeLock` existe, `request('screen')` guardando el sentinel; volver a pedir en `visibilitychange` → `visible`; `release()` al desactivar o desmontar. Errores ignorados.
- [ ] **Step 4: Cableado** — en `rb-app.tsx`: `const alert = useRestAlert(data.profile.restSound ?? true)`; `useRestTimer(…, alert.fire)`; `saveSet` llama `alert.unlock()` antes de validar; `useWakeLock(data.active !== null && tab === 'train' && (data.profile.keepAwake ?? true))`.
- [ ] **Step 5: Perfil** — tarjeta `card settings-card` con `section-label` «EN SESIÓN» (icono `Timer`) y dos `label.switch-row` (markup del editor): «Sonido al terminar el descanso» / small «Una campana corta, aunque el iPhone esté en silencio.»; «Mantener la pantalla encendida» / small «Solo mientras entrenas.» `checked={profile.restSound ?? true}` → `onProfileChange({ restSound: e.target.checked })`, igual para `keepAwake`.
- [ ] **Step 6: Comprobar** en Chrome de escritorio (Playwright no reproduce audio con fiabilidad): descanso de 5 s → suena, barra amarilla con «Descanso terminado · Serie 2»; con el interruptor apagado no suena pero sí cambia la barra. Captura de Perfil 390 claro/oscuro. `npm run verify` → OK. Commit: `feat(sesion): aviso al terminar el descanso y pantalla encendida en sesión`.

---

### Task 7: Copia de ejercicios y avance automático (A3)

**Files:**

- Modify: `components/rb-app.tsx` (`startWorkout`, `saveSet`, `selectExercise`, `finishWorkout`), `components/views/active-session-view.tsx` (lista con ✓, CTA final), `app/glass.css` (`.exercise-choice.done`, `.finish-btn.primary`)

**Interfaces:**

- Consumes: `sessionExercises`, `exerciseProgress`, `nextPendingExercise` (Task 2); `ActiveWorkout.exercises` (Task 3).
- Produces: la vista recibe `exercises: RoutineExercise[]` (ya no lee `routine.exercises`) y `allComplete: boolean`.

- [ ] **Step 1: `startWorkout`** — `active: { id, routineId, startedAt, sets: [], exercises: structuredClone(routine.exercises) }`.
- [ ] **Step 2: `rb-app.tsx`** — `const exercises = data.active ? sessionExercises(data.active, activeRoutine) : []`; `currentRx` y `progression` se calculan sobre `exercises`; `allComplete = exercises.length > 0 && exercises.every((rx) => exerciseProgress(data.active.sets, rx).complete)`.
- [ ] **Step 3: `saveSet`** — tras añadir la serie: `const sets = [...active.sets, entry]`; si `exerciseProgress(sets, currentRx).complete` y no lo estaba antes: `const next = nextPendingExercise(exercises, sets, selectedExercise)`; si `next` → `selectExercise(next)` y toast «{actual} completado · Siguiente: {siguiente}»; si no → toast «Todos los ejercicios completados. Finaliza cuando quieras.». Si no completó: toast actual «Serie registrada. Buen trabajo.». `selectExercise` debe aceptar `setsOverride?: SetEntry[]` para precargar con las series recién guardadas.
- [ ] **Step 4: Vista** — `exercise-choice` con clase `done` cuando `complete`; dentro, `<Check size={15}/>` tras el contador y `aria-label` «{nombre}, completado». `finish-btn` con clase `primary` (estilo `lime-btn`) cuando `allComplete`.
- [ ] **Step 5: Estilos** — `.exercise-choice.done strong { color: var(--acid) }` (claro: `var(--accent)` si el amarillo no contrasta), `.exercise-choice.done` borde `rgb(var(--acid-rgb)/.35)`; `.finish-btn.primary` hereda `.lime-btn`.
- [ ] **Step 6: Comprobar** con Playwright: guardar 3 series → el seleccionado pasa al 2.º, el 1.º lleva ✓; completar todos → «Finalizar» amarillo. `npm run verify` → OK. Commit: `feat(sesion): avance automático al completar las series objetivo`.

---

### Task 8: Sustituir, quitar y añadir en sesión; guardar en la rutina al finalizar (A5)

**Files:**

- Create: `components/modals/exercise-picker-modal.tsx`
- Modify: `components/modals/exercise-picker.tsx` (props `title?`, `single?`), `components/rb-app.tsx`, `components/views/active-session-view.tsx`, `app/glass.css`

**Interfaces:**

- Consumes: `choose` (Task 4); `sessionDiffersFromRoutine`, `nextPendingExercise` (Task 2); `makeRx` (`lib/format.ts`).
- Produces:

```ts
// ExercisePickerModal
{ title: string; excluded: string[]; single?: boolean; onAdd(id: string): void; onClose(): void }
// rb-app: estado picker: null | { mode: 'replace'; exerciseId: string } | { mode: 'add' }
// vista: onReplaceExercise(id), onRemoveExercise(id), onAddExercise()
```

- [ ] **Step 1: `ExercisePicker`** — `title` (por defecto «Añadir ejercicios») y `single`: en `single`, el botón de fila llama `onAdd` y el modal cierra; el pie «Toca + para añadir» pasa a «Toca + para elegir».
- [ ] **Step 2: `ExercisePickerModal`** — `modal-backdrop` + `modal editor-sheet` (mismo patrón que `RoutineEditorModal`), `role="dialog"`, cierra con fondo; en `single`, `onAdd` → `onAdd(id); onClose()`.
- [ ] **Step 3: `rb-app.tsx`** —
  - `replaceExercise(oldId, newId)`: `active.exercises` con el hueco sustituido (`{ ...rx, exerciseId: newId }`); si `selectedExercise === oldId` → `selectExercise(newId)`; toast «{nuevo} ocupa el lugar de {viejo}».
  - `removeExercise(id)`: si `exercises.length === 1` → toast «Deja al menos un ejercicio en la sesión.»; si tiene series → `confirm({ title: '¿Quitar este ejercicio?', message: 'Se borrarán N series registradas de este ejercicio.', confirmLabel: 'Quitar', danger: true })`; al confirmar: quitar de `exercises` y filtrar `sets`; si era el seleccionado → `selectExercise(nextPendingExercise(restantes, sets, id) ?? restantes[0].exerciseId)`.
  - `addExercise(id)`: `exercises: [...exercises, makeRx(id)]`.
  - `finishWorkout`: si `sessionDiffersFromRoutine(exercises, activeRoutine?.exercises)` → `const choice = await choose({ title: 'Cambiaste esta sesión', message: `¿Actualizar la rutina «${activeRoutine.name}» con los ejercicios y descansos de hoy?`, confirmLabel: 'Actualizar rutina', cancelLabel: 'Mantener rutina' })`; `null` → return; `'confirm'` → `editRoutine(id, (r) => ({ ...r, exercises }))`; luego el cierre actual.
- [ ] **Step 4: Vista** — bajo el nombre del ejercicio actual, fila `.log-actions` con `text-link` «Sustituir» (solo si `setsForCurrent.length === 0`) y «Quitar» (rojo); al final de `exercise-choices`, botón `exercise-add` «+ Añadir ejercicio» (≥ 44 px).
- [ ] **Step 5: Comprobar** con Playwright: sustituir sin series (hereda 3×8–12/90 s), quitar con series (diálogo rojo), añadir dos, finalizar → diálogo; «Mantener rutina» deja la rutina igual; «Actualizar rutina» la cambia; cerrar con X no finaliza. `npm run verify` → OK. Commit: `feat(sesion): sustituir, quitar y añadir ejercicios en sesión`.

---

### Task 9: Aviso de subir de peso (A6)

**Files:**

- Modify: `components/rb-app.tsx` (precarga), `components/views/active-session-view.tsx` (etiqueta y tarjeta), `components/views/train-view.tsx:175`, `components/views/today-view.tsx:99-103`, `app/glass.css` (`.raise-chip`, `.progression-hint.raise`)

**Interfaces:**

- Consumes: `progressionAdvice` (`lib/metrics.ts`), `raiseCount` (Task 2), `fromKg`/`showUnit` (rb-app).
- Produces: la vista recibe `raiseFor: Record<string, number>` (exerciseId → kg propuesto) para los pendientes con `kind === 'increase'`; Entrenar y Hoy reciben `raiseCount` por rutina.

- [ ] **Step 1: Precarga** — en `selectExercise` (y en `startWorkout` para el primero): si no hay series de ese ejercicio en la sesión y `progressionAdvice(...).kind === 'increase'` → `setWeight(Number(fromKg(proposedWeightKg).toFixed(1)))`.
- [ ] **Step 2: Vista de sesión** — en cada `exercise-choice` pendiente con propuesta: `<span className="raise-chip">↑ {showUnit(kg)}</span>`; `progression-hint` gana clase `raise` cuando `kind === 'increase'` y el texto pasa a «Toca subir: {nuevo}. Completaste {targetSets} × {maxReps} con {anterior} la última vez.»; el caso `repeat` queda como está.
- [ ] **Step 3: Entrenar y Hoy** — `raiseCount(data.workouts, routine.exercises)`; si > 0: en Entrenar, línea `<small className="raise-line">↑ Subir de peso en N ejercicio(s)</small>` bajo el subtítulo; en Hoy, misma frase como `<p className="hoy-meta raise-line">` bajo la meta del hero. Singular/plural correcto.
- [ ] **Step 4: Estilos** — `.raise-chip`: fondo `rgb(var(--acid-rgb)/.16)`, texto `--acid` (claro: `--accent`), radio 7, 11 px, `font-family: var(--font-cond)`; `.progression-hint.raise`: borde `rgb(var(--acid-rgb)/.45)`, fondo `.08`; `.raise-line` color `--acid`/`--accent`.
- [ ] **Step 5: Comprobar** con datos sembrados en el mock (una sesión previa 3×12 a 20 kg en `chest-press`): chip «↑ 20.5 kg», peso precargado 20.5, Entrenar y Hoy con la línea. `npm run verify` → OK. Commit: `feat(progresion): aviso visible de subir de peso`.

---

### Task 10: Versión, CHANGELOG, verificación final y PR

**Files:**

- Modify: `package.json`, `package-lock.json` (0.9.0), `CHANGELOG.md`

- [ ] **Step 1: CHANGELOG `[0.9.0] — <fecha>`** — Añadido: descanso fijo y ajustable con aviso; avance automático; cambios de ejercicios en sesión con guardado opcional; aviso de subir de peso; ajustes «En sesión» en Perfil. Cambiado: teléfono en horizontal con formato de teléfono. Nota sobre límites en iPhone (vibración, segundo plano).
- [ ] **Step 2: `npm run verify` && `npx next build`** → OK.
- [ ] **Step 3: Capturas finales** 390×844, 844×390, 1280×800 en claro y oscuro (Hoy, Entrenar, sesión corriendo, sesión terminada, diálogo de finalización, Perfil) y auditoría `audit.py` en 390×844 y 844×390 (sin objetivos < 44 px nuevos ni scroll horizontal).
- [ ] **Step 4: Commit** `chore: versión 0.9.0` y PR contra `main` con el cuerpo del repo (qué cambia, archivos, verificación, para revisar: probar en iPhone real el sonido con el interruptor en silencio y el wake lock). Reportar CI en verde y enviar capturas al usuario.
