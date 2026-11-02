# RB Fitness 0.6 — ciclos personales, progreso en la nube y guía visual de 100 ejercicios (fotos y video opcional)

App de entrenamiento en gimnasio: Next.js 16, React 19, TypeScript y Supabase (Auth + Postgres). Mobile-first y PWA. Los cambios por versión están en [CHANGELOG.md](CHANGELOG.md).

## Qué hace

- Ciclo de entrenamiento libre: crea, duplica, reordena y elimina días de fuerza o descanso; personaliza ejercicios, series, repeticiones y descanso por rutina.
- Sesión activa con registro de series (peso × reps), temporizador de descanso y sugerencia conservadora de progresión.
- Progreso: anillos semanales, volumen por semana, series por músculo, historial y 1RM estimado.
- Cuenta con correo y contraseña; los datos viven en Supabase (`public.rb_user_data`, una fila JSON por usuario protegida con RLS). Indicador `EN NUBE / GUARDANDO / NO GUARDADO` y control de conflictos entre dispositivos.
- Biblioteca de 100 ejercicios para el equipo de Planet Fitness, con dos fotos por ejercicio (inicio y final) como guía de movimiento. Fotos de [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), dominio público; ver `public/exercises/CREDITS.md`.
- Video opcional: cada ficha tiene «Buscar video» (abre YouTube con la técnica del ejercicio) y, cuando existe un clip propio en `lib/exercise-videos.ts`, pestañas Fotos/Video con reproductor integrado. Ver «Videos de ejercicios».
- Tema claro/oscuro/sistema guardado por dispositivo; descarga de una copia de los datos en JSON.

## Configurar Supabase (una vez por proyecto)

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
2. **SQL Editor** → ejecuta íntegramente `supabase/schema.sql` (tabla, RLS y RPC `rb_save_state`).
3. **Authentication → Providers → Email**: habilitado, con acceso por contraseña. «Confirm email» encendido para producción (configura antes un SMTP propio en Project Settings → Auth; el servicio integrado permite 2 correos por hora) o apagado mientras pruebas.
4. **Authentication → URL Configuration**: `Site URL` = URL de producción (`https://TU-DOMINIO.vercel.app`) y la misma URL en `Redirect URLs`. Añade los dominios de Preview si los usas. Los enlaces de confirmación y de recuperación vuelven a `/`.
5. **Vercel → Settings → Environment Variables** (tipo _Config_, entorno _Production_):
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://...supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: clave `sb_publishable_...` (nunca `sb_secret_...` ni `service_role`)
6. Redespliega (Deployments → Redeploy, sin caché). Abre la URL en una ventana de incógnito: debe aparecer el formulario de acceso.

Sin estas variables la app muestra «Sincronización pendiente de configuración» y no permite entrar.

## Desarrollo

Requiere Node.js 22.

```bash
npm install
npm run dev          # http://localhost:3000 (necesita NEXT_PUBLIC_SUPABASE_* en .env.local)
npm run verify       # lint + formato + typecheck + pruebas unitarias
npm run build
```

### Probar sin un proyecto Supabase real

`scripts/dev/mock-supabase.mjs` simula en memoria Auth (contraseña), la lectura de `rb_user_data` y el RPC `rb_save_state`:

```bash
node scripts/dev/mock-supabase.mjs                       # http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_mock npm run dev
```

`MOCK_CONFIRM_EMAIL=1` hace que el registro exija confirmación (sin sesión al crear la cuenta). `GET /__mock/recovery-link?email=...` devuelve el fragmento de URL de un enlace de recuperación para probar el flujo de nueva contraseña.

## Arquitectura

- `app/`: App Router, estilos globales (`globals.css`, variables de tema) y PWA (`manifest.ts`, `public/sw.js`). `layout.tsx` fija `data-theme` antes de pintar.
- `components/rb-app.tsx`: orquestador. Vistas en `components/views/`, modales en `components/modals/`, barra lateral/superior/inferior en `components/shell/`, piezas comunes en `components/ui/`.
- `components/auth-screen.tsx`: entrar, crear cuenta, recuperar y nueva contraseña.
- `hooks/use-auth.ts`: cliente Supabase y sesión (incluye el evento `PASSWORD_RECOVERY`).
- `hooks/use-cloud-sync.ts`: estado `AppData`, cola de escritura serializada con debounce y control de revisión.
- `hooks/use-theme.ts`, `lib/theme.ts`: preferencia de tema por dispositivo.
- `lib/cycles.ts`, `lib/metrics.ts`, `lib/storage.ts`: funciones puras (ciclo, estadísticas, validación de respaldos). Probadas por `scripts/check-*.{cjs,mjs}`.
- `lib/catalog.ts`: los 100 ejercicios con sus fotogramas en `public/exercises/<id>/{0,1}.webp`. `lib/exercise-videos.ts`: clips opcionales por ejercicio; `lib/video.ts`: enlace de búsqueda de video.
- `lib/cloud.ts`: lectura y escritura en Supabase. `supabase/schema.sql`: tabla, RLS y RPC.

## Videos de ejercicios

Hay dos formas de ver un video, ambas opcionales:

- **Buscar video** (siempre disponible, los 100 ejercicios): abre en una pestaña nueva una búsqueda de YouTube con el nombre del ejercicio. No se incrusta nada de terceros ni se descarga nada.
- **Clip propio en la ficha**: si un ejercicio tiene entrada en `lib/exercise-videos.ts`, la ficha muestra las pestañas **Fotos / Video** y un reproductor (`preload="none"`: no consume datos hasta pulsar play; el service worker no los cachea).

Para añadir un clip (por ejemplo, grabado por ti en las máquinas de tu gimnasio):

1. Exporta el video en H.264 sin audio, de 3 a 6 s en bucle, 3:2 o 4:3, máximo ~1,5 MB. Con ffmpeg: `ffmpeg -i entrada.mov -an -vf "scale=720:-2" -c:v libx264 -crf 28 -movflags +faststart loop.mp4`.
2. Guárdalo en `public/exercises/<id>/loop.mp4` (el `<id>` es el de `lib/catalog.ts`, p. ej. `chest-press`) o súbelo a un bucket público y usa su URL https.
3. Añade `'<id>': { src: '/exercises/<id>/loop.mp4', credit: 'Autor · licencia' }` en `lib/exercise-videos.ts`.

`npm run verify` comprueba que el id exista y que el archivo local esté presente. Usa solo material que grabaste tú o cuya licencia permita redistribuirlo, e indica siempre el crédito.

## Datos anteriores

Desde 0.4 los datos viven solo en la cuenta; ya no hay importación de historial local. Perfil → Cuenta → «Descargar una copia de mis datos» genera un JSON de respaldo.

## Límites actuales

- Cloud-first: sin conexión no se puede iniciar una sesión de entrenamiento ni guardar. La cola de escritura sin conexión está planificada.
- En un conflicto entre dos dispositivos RB detiene la escritura y muestra el error; exporta antes de recargar.
- Aún no hay eliminación de cuenta dentro de la app (requisito para publicar en tiendas).

## Flujo de trabajo

Ramas por cambio y pull request a `main`; GitHub Actions ejecuta `lint`, `format:check`, `test:metrics`, `test:cycles`, `typecheck` y `build`. Un push a `main` despliega en Vercel automáticamente, así que `main` solo recibe cambios con CI en verde y Supabase configurado.
