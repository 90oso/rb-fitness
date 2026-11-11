# Sesión activa: descanso, siguiente ejercicio, horizontal, cambios en vivo y subir de peso

Fecha: 2026-11-11 · Estado: aprobado en conversación · Entrega A de tres (B: editor y selector; C: compartir por enlace).

## 1. Objetivo

Que entrenar con RB en el gimnasio no exija pelearse con la app: el descanso se ve y avisa solo, al completar
un ejercicio la app ya está en el siguiente, el teléfono girado sigue siendo un teléfono, un ejercicio con la
máquina ocupada se sustituye en el momento, y cuando toca subir de peso la app lo dice antes de la primera serie.

Origen: observaciones del usuario tras usar la versión 0.8.1 en sus sesiones (11 nov 2026).

### En alcance

- A1 Temporizador de descanso fijo en pantalla y ajustable en vivo (−15 s, +15 s, omitir).
- A2 Aviso al terminar el descanso: sonido, vibración donde exista, cambio visual; pantalla encendida en sesión.
- A3 Al completar las series objetivo de un ejercicio, pasar automáticamente al siguiente pendiente.
- A4 Teléfono en horizontal con formato de teléfono (no de tableta/escritorio).
- A5 Sustituir, quitar y añadir ejercicios durante la sesión; al finalizar, ofrecer guardar los cambios en la rutina.
- A6 Aviso visible de «toca subir de peso» antes de la serie, en la sesión, en Entrenar y en Hoy.

### Fuera de alcance

- Notificaciones con el teléfono bloqueado (push vía servidor). Queda para una entrega posterior.
- Rediseño del editor de rutinas y del selector de ejercicios (entrega B).
- Compartir rutinas (entrega C).
- Cambiar la regla de progresión (sigue siendo la de `progressionAdvice`).

## 2. Modelo de datos

```ts
interface ActiveWorkout {
  id: string;
  routineId: string;
  startedAt: string;
  sets: SetEntry[];
  /** Copia de los ejercicios de la rutina al iniciar; la sesión edita esta copia, nunca la rutina. */
  exercises?: RoutineExercise[]; // ausente en sesiones iniciadas antes de 0.9.0 → se usa la rutina
}
interface Profile {
  // … campos actuales …
  restSound?: boolean; // ausente = true
  keepAwake?: boolean; // ausente = true
}
```

- `safeParse` acepta `active.exercises` (mismas reglas que los ejercicios de una rutina, máximo 100) y los dos
  booleanos opcionales del perfil; cualquier otro valor se descarta sin invalidar el resto.
- `Routine` y `Workout` no cambian. El historial sigue guardando solo las series realizadas.
- El temporizador de descanso **no** va a la nube: se guarda en `localStorage` como
  `rb-rest = { activeId, exerciseId, endsAt }` para sobrevivir una recarga; se borra al finalizar o descartar la
  sesión y se ignora si `activeId` no coincide con la sesión activa.

## 3. Comportamiento

### A1 Temporizador fijo y ajustable

- Componente `RestBar`, visible solo con sesión activa y un descanso en curso o recién terminado.
  - Teléfono en vertical: fijo encima de la navegación inferior (misma anchura que la cápsula, mismo cristal).
  - Teléfono en horizontal y escritorio: `position: sticky` en la parte superior de la columna de registro.
- Contenido: icono, «Descanso», tiempo `mm:ss`, botones **−15 s**, **+15 s**, **Omitir**. Objetivos táctiles ≥ 44 px.
- **−15 s / +15 s** mueven el fin del conteo en curso y además fijan `restSeconds` de ese ejercicio en
  `active.exercises` (acotado a 0–1800 s). Así la siguiente serie usa el tiempo ajustado y el cambio entra en la
  pregunta de guardado al finalizar (A5).
- **Omitir** termina el descanso sin aviso.
- El reloj ya existente (`now` cada segundo en sesión) alimenta el conteo; no se añade otro `setInterval`.

### A2 Aviso al terminar

- Cuando el conteo pasa por cero (por el reloj, no por «Omitir»), una sola vez por descanso:
  1. Sonido: `public/sounds/descanso.mp3` (campana de dos tonos, ~1 s, hecha para RB) reproducido por un elemento
     `<audio>` creado una vez; se «desbloquea» en el primer toque de «Guardar serie» (play silenciado + pausa),
     requisito de iOS. Un `<audio>` suena en iPhone aunque el interruptor esté en silencio; Web Audio no, por eso
     no se usa.
  2. Vibración: `navigator.vibrate([180, 90, 180])` donde exista (Android). En iPhone no existe; se intenta el
     toque háptico de `<input type="checkbox" switch>` (iOS 17.4+) mediante un clic programático, sin garantía.
  3. Visual: la barra pasa a amarillo con «Descanso terminado · Serie N» y una pulsación de 3 s (sin animación con
     `prefers-reduced-motion`). Se queda así hasta que se guarda la siguiente serie, se cambia de ejercicio o se
     cierra con la X de la barra. `aria-live="polite"` para lectores de pantalla.
- Si la app estaba en segundo plano al llegar a cero (iPhone la suspende), el aviso se dispara al volver.
- Pantalla encendida: `navigator.wakeLock.request('screen')` mientras hay sesión activa, la pestaña Entrenar está
  abierta y el documento es visible; se vuelve a pedir al volver a primer plano y se libera al salir. Si la API
  no existe, no pasa nada.
- Perfil → nueva tarjeta «En sesión» con dos interruptores: «Sonido al terminar el descanso» y «Mantener la
  pantalla encendida». Ambos activados de inicio.

### A3 Ejercicio completado → siguiente

- Un ejercicio está completo cuando sus series registradas en la sesión ≥ `targetSets`.
- Al guardar la serie que lo completa: se marca con ✓ en la lista «Ejercicio actual», y la app selecciona de
  inmediato el **siguiente pendiente**: el primero después del actual en el orden de la sesión; si no hay, el
  primero pendiente desde el principio. Aviso: «Press de pecho completado · Siguiente: Press inclinado».
- Si no queda ninguno pendiente: aviso «Todos los ejercicios completados. Finaliza cuando quieras.» y el botón
  «Finalizar entrenamiento» pasa a estilo principal (amarillo).
- El descanso iniciado por esa serie sigue corriendo (tiempo del ejercicio completado).
- Tocar un ejercicio completo lo vuelve a seleccionar y permite registrar series extra; eso no lo «descompleta».

### A4 Horizontal

- Regla única de «esto es un teléfono»: `lib/layout.ts` exporta `PHONE_QUERY = '(max-width: 800px), (max-height: 500px)'`;
  `useHideOnScroll` la usa. En CSS se escribe literal, con comentario que apunta a la constante.
- CSS: toda regla `(max-width: 800px)` pasa a `(max-width: 800px), (max-height: 500px)`; `(min-width: 801px)` pasa a
  `(min-width: 801px) and (min-height: 501px)`; las de `(max-width: 600px)` (densidad y escala) pasan a
  `(max-width: 600px), (max-height: 500px)`. Resultado: en horizontal no hay barra lateral, sigue la cápsula
  inferior compacta y la barra superior que se esconde.
- Bloque nuevo `@media (max-height: 500px) and (orientation: landscape)`: `.active-layout` en dos columnas
  (ejercicios | registro), `.hoy` en dos columnas (próxima sesión | semana), `.routine-grid` en dos columnas.
  Progreso, Ejercicios y Perfil se quedan en una columna.
- Límite: 500 px de alto también atrapa una ventana de escritorio muy baja; aceptable.

### A5 Cambiar ejercicios en sesión

- `startWorkout` copia `routine.exercises` en `active.exercises`. Toda la vista de sesión lee
  `sessionExercises(active, routine)` (la copia, o la rutina si la copia no existe).
- En la tarjeta de registro, junto al nombre del ejercicio actual: **Sustituir** (solo si ese ejercicio aún no
  tiene series en la sesión) y **Quitar**. Al final de la lista «Ejercicio actual»: **Añadir ejercicio**.
- **Sustituir** abre el selector del catálogo en modo «uno» (excluye los ya presentes); el elegido ocupa el mismo
  hueco y hereda `targetSets`, `minReps`, `maxReps` y `restSeconds`. Peso y reps se precargan como al seleccionar.
- **Quitar**: si tiene series registradas, confirmación en rojo «Se borrarán N series registradas de este
  ejercicio»; al confirmar se quitan el ejercicio y sus series. No se puede quitar el último ejercicio (aviso).
  Si era el seleccionado, se selecciona el siguiente pendiente (o el primero).
- **Añadir** abre el selector en modo «varios» (como el editor); cada elegido se añade al final con los valores
  por defecto (`makeRx`: 3 × 8–12, 90 s).
- La rutina no cambia durante la sesión.
- **Al finalizar**, si `sessionDiffersFromRoutine` (distintos ids, distinto orden o distinto `restSeconds`):
  diálogo de tres salidas con `choose()`:
  - título «Cambiaste esta sesión», texto «¿Actualizar la rutina “X” con los ejercicios y descansos de hoy?»;
  - **Actualizar rutina** → `routine.exercises = active.exercises` y se guarda la sesión;
  - **Mantener rutina** → se guarda la sesión, la rutina queda igual;
  - cerrar (X, Escape, fondo) → no pasa nada, la sesión sigue.
    `useConfirm` gana `choose(options): Promise<'confirm' | 'cancel' | null>`; `confirm()` sigue devolviendo
    `boolean` (cerrar = `false`). `ConfirmDialog` distingue cancelar de cerrar.

### A6 Aviso de subir de peso

- Regla: la actual (`progressionAdvice` → `kind === 'increase'`), evaluada con `targetSets` y `maxReps` del
  ejercicio en la sesión (o en la rutina, fuera de sesión).
- En la sesión: el ejercicio pendiente lleva una etiqueta amarilla «↑ 25 kg» en la lista; al seleccionarlo, el
  peso se precarga con `proposedWeightKg` (si aún no tiene series en la sesión); en la tarjeta de registro el
  aviso pasa de frase gris a tarjeta destacada con borde amarillo: «Toca subir: 25 kg. Completaste 3 × 12 con
  22.5 kg la última vez.»
- En Entrenar: bajo el subtítulo de la rutina, «↑ Subir de peso en 2 ejercicios» cuando aplique.
- En Hoy: misma frase en el hero de la próxima sesión, debajo de «5 ejercicios · Planet Fitness».
- Sin cambios en la regla ni en el incremento (2.5 %, mínimo 0.5 kg).

## 4. Estructura del código

| Pieza                                               | Responsabilidad                                                                                                                                                            |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/layout.ts`                                     | `PHONE_QUERY`.                                                                                                                                                             |
| `lib/session.ts` (puro, sin React)                  | `sessionExercises`, `exerciseProgress`, `isComplete`, `nextPendingExercise`, `adjustRest`, `sessionDiffersFromRoutine`, `raiseCount`, serialización del descanso.          |
| `hooks/use-rest-timer.ts`                           | `endsAt` en estado + `localStorage`; `start(seconds)`, `adjust(±s)`, `skip()`, `dismiss()`; `remainingMs`, `phase: 'idle' \| 'running' \| 'done'`; emite `onDone` una vez. |
| `hooks/use-rest-alert.ts`                           | Elemento `<audio>` único, `unlock()`, `fire()` (sonido + vibración + háptico), respeta `restSound`.                                                                        |
| `hooks/use-wake-lock.ts`                            | Pide y libera el wake lock según `enabled` y visibilidad.                                                                                                                  |
| `components/session/rest-bar.tsx`                   | Barra fija/pegajosa con estado `running`/`done`.                                                                                                                           |
| `components/modals/exercise-picker-modal.tsx`       | Hoja modal que envuelve `ExercisePicker`; prop `single` (cierra al elegir uno).                                                                                            |
| `components/views/active-session-view.tsx`          | Lista con ✓ y «↑ peso», botones Sustituir/Quitar/Añadir, tarjeta de progresión destacada, CTA final.                                                                       |
| `components/rb-app.tsx`                             | Orquesta: snapshot al iniciar, avance automático, diálogo de finalización, precarga de peso.                                                                               |
| `components/views/profile-view.tsx`                 | Tarjeta «En sesión» con los dos interruptores.                                                                                                                             |
| `components/views/train-view.tsx`, `today-view.tsx` | Línea «↑ Subir de peso en N ejercicios».                                                                                                                                   |
| `app/glass.css`, `app/globals.css`                  | Consultas de medios según A4, estilos de la barra, etiquetas, bloque horizontal.                                                                                           |
| `public/sounds/descanso.mp3`                        | Campana de fin de descanso.                                                                                                                                                |

`rb-app.tsx` ya es grande (514 líneas); las funciones puras salen a `lib/session.ts` y el temporizador a su hook
para que el orquestador crezca lo menos posible.

## 5. Pruebas

- `scripts/check-session.cjs` (mismo estilo que `check-metrics.cjs`, en `npm run verify` como `test:session`):
  - `nextPendingExercise`: siguiente en orden, vuelta al principio, ninguno pendiente, ejercicio actual ausente.
  - `isComplete`/`exerciseProgress` con series extra.
  - `sessionExercises` con y sin copia.
  - `adjustRest` acotado a 0–1800 y aplicado al ejercicio correcto.
  - `sessionDiffersFromRoutine`: igual, otro orden, sustituido, descanso distinto, uno añadido/quitado.
  - `raiseCount` con la regla de progresión.
  - Serialización del descanso: ignora `activeId` ajeno y fechas inválidas.
- `safeParse`: casos nuevos en `scripts/check-metrics.cjs` (acepta `active.exercises` y booleanos del perfil;
  descarta valores inválidos).
- Manual con Playwright (como en entregas anteriores): 390×844 y 844×390 en claro y oscuro, 1280×800; sesión con
  descanso corriendo, estado «terminado», ejercicio completado con avance, diálogo de finalización, Perfil.
  Comprobar que en 844×390 no aparece la barra lateral y que la barra de descanso no tapa los controles.
- `npm run verify` (lint, formato, tipos, métricas, ciclos, sesión) y compilación.

## 6. Accesibilidad y rendimiento

- Barra de descanso: `role="status"`, `aria-live="polite"`; botones con etiqueta; contraste del estado amarillo
  verificado en claro y oscuro.
- Sin animación de pulso con `prefers-reduced-motion`.
- El wake lock solo mientras se entrena; nunca en otras pestañas.
- El sonido se carga con `preload="auto"` solo al entrar en sesión.

## 7. Riesgos y límites conocidos

- iPhone: vibración no disponible para apps web; el háptico es «si funciona, bien». El aviso fiable es el sonido.
- Con la app en segundo plano iOS detiene el reloj: el aviso llega al volver a la app. Por eso la pantalla se
  mantiene encendida en sesión.
- Sesiones iniciadas con 0.8.x y aún abiertas: funcionan con la rutina como lista (sin copia); al finalizar no se
  pregunta nada porque no hubo cambios registrables.

## 8. Versión

0.9.0, con entrada en `CHANGELOG.md` (Añadido: A1–A3, A5, A6; Cambiado: A4).
