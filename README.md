# RB Fitness 0.4 — ciclos personales, progreso en la nube y acceso con contraseña

App de entrenamiento en gimnasio: Next.js 16, React 19, TypeScript y Supabase (Auth + Postgres). Mobile-first y PWA. Los cambios por versión están en [CHANGELOG.md](CHANGELOG.md).

## Qué hace

- Ciclo de entrenamiento libre: crea, duplica, reordena y elimina días de fuerza o descanso; personaliza ejercicios, series, repeticiones y descanso por rutina.
- Sesión activa con registro de series (peso × reps), temporizador de descanso y sugerencia conservadora de progresión.
- Progreso: anillos semanales, volumen por semana, series por músculo, historial y 1RM estimado.
- Cuenta con correo y contraseña; los datos viven en Supabase (`public.rb_user_data`, una fila JSON por usuario protegida con RLS). Indicador `EN NUBE / GUARDANDO / NO GUARDADO` y control de conflictos entre dispositivos.
- Tema oscuro/claro/sistema guardado por dispositivo; respaldo e importación JSON.

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
- `lib/cloud.ts`: lectura y escritura en Supabase. `supabase/schema.sql`: tabla, RLS y RPC.

## Migrar datos de RB 0.2

En la app 0.2, Perfil → Exportar JSON. En 0.4, entra con tu cuenta y usa Perfil → Tus datos → _Importar historial anterior de este navegador_ o _Importar JSON_. La importación reemplaza (no fusiona) los datos de la cuenta; se pide confirmación.

## Límites actuales

- Cloud-first: sin conexión no se puede iniciar una sesión de entrenamiento ni guardar. La cola de escritura sin conexión está planificada.
- En un conflicto entre dos dispositivos RB detiene la escritura y muestra el error; exporta antes de recargar.
- Aún no hay eliminación de cuenta dentro de la app (requisito para publicar en tiendas).

## Flujo de trabajo

Ramas por cambio y pull request a `main`; GitHub Actions ejecuta `lint`, `format:check`, `test:metrics`, `test:cycles`, `typecheck` y `build`. Un push a `main` despliega en Vercel automáticamente, así que `main` solo recibe cambios con CI en verde y Supabase configurado.
