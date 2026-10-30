# RB Fitness 0.3 — ciclos personales + progreso en la nube

App de entrenamiento Next.js, TypeScript, Tailwind y Supabase Auth. Mobile-first y PWA.

## Cambios v0.3

- Construye tu ciclo de entrenamiento: crear, duplicar, reordenar y eliminar días de fuerza o descanso. No está limitado a cinco días ni a Push/Pull/Legs.
- Personaliza nombre, descripción, grupo de ejercicios, series, rango de repeticiones y tiempo de descanso. Los días flexibles pueden activar recomendaciones heurísticas.
- Se preserva el historial al eliminar/modificar una rutina. No se puede eliminar la rutina de la sesión activa.
- Los datos de entrenamiento **se guardan exclusivamente en Supabase** al iniciar sesión, no en `localStorage`. Supabase Auth sí puede almacenar el token de sesión en el navegador.
- Indicador `EN NUBE / GUARDANDO / NO GUARDADO`; protección contra cerrar la pestaña cuando hay escrituras pendientes y control optimista de conflictos entre dispositivos.
- Importación opcional y explícita de los registros de la versión local anterior; los datos originales se borran del navegador únicamente cuando el servidor confirma que recibió la migración.
- Exportación/importación JSON como respaldo manual.

**Importante:** la versión 0.3 no funcionará para registrar entrenamientos hasta configurar Supabase. No se simula guardar progreso si no hay backend. No fusionar con `main` antes de que Supabase y Vercel estén configurados y un despliegue Preview pase las pruebas.

## Configurar Supabase (una vez por proyecto)

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard). Conserva el acceso únicamente en la cuenta administradora.
2. Abre **SQL Editor**, ejecuta íntegramente `supabase/schema.sql`. Habilita RLS y una función RPC con control de versión por usuario.
3. Ve a **Authentication > URL Configuration**: configura `Site URL` con la URL de RB en producción; añade los dominios de Preview necesarios en Redirect URLs si vas a probar Preview.
4. Comprueba que el acceso por correo esté habilitado en **Authentication > Providers > Email**. `signInWithOtp` usa enlace de acceso por correo; los correos pueden estar sujetos a límites de Supabase. Para producción, configura un proveedor SMTP propio.
5. En **Vercel > RB Fitness > Settings > Environment Variables** añade para los entornos que uses:
    - `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto (`https://...supabase.co`).
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: clave **publishable** (`sb_publishable_...`). No uses clave `service_role` ni `secret` en variables `NEXT_PUBLIC_*`.
6. Vuelve a desplegar. El usuario inicia sesión con su correo, completa su ciclo y se guarda en la tabla `public.rb_user_data`.

El SQL incluye políticas RLS que requieren `auth.uid() = user_id`. Ningún usuario puede leer/escribir el JSON de otro usuario con el cliente público. **La cuenta es obligatoria** para usar la versión cloud-first.

## Migrar datos de RB 0.2

**Antes:** en la app 0.2, ve a Perfil > Exportar JSON. Guarda ese archivo fuera del navegador.

**Después:** inicia sesión en 0.3. En Perfil > Tus datos, usa *Importar historial anterior de este navegador* o *Importar JSON*. Se solicitará confirmación antes de reemplazar tus datos de nube. Espera a que el indicador marque **EN NUBE**. El archivo JSON sigue siendo tu copia de seguridad externa.

No se mezclan automáticamente dos historiales de cuentas distintas, porque podrían compartir identificadores y modificar fechas/series. La migración actualmente es por reemplazo explícito, no una fusión.

## Desarrollo y validación

Requisitos Node.js 22. `npm install` instala dependencias, `npm run dev` inicia localmente. Para comprobaciones:

```bash
npm run test:metrics
npm run test:cycles
npm run typecheck
npm run build
```

Recomendamos abrir un pull request a `main`: GitHub Actions ejecuta esas comprobaciones. Una vez configuradas las variables de la Preview y revisado el build en Vercel, realizar prueba manual de inicio de sesión, rutina de 2 días, guardar una sesión, cerrar/abrir en otro dispositivo, importar respaldo y verificar RLS con dos usuarios.

## Arquitectura

- `app`: App Router, estilo y PWA.
- `components/rb-app.tsx`: UI actual; modularizar tras estabilizar el flujo.
- `components/cloud-gate.tsx`: inicio de sesión por enlace de correo.
- `lib/cycles.ts`: funciones puras para gestión del ciclo.
- `lib/cloud.ts`: cliente Supabase, lectura y escritura con control de revisión.
- `lib/metrics.ts`: estadísticas y progresión orientativa.
- `lib/storage.ts`: validación de respaldos y lector *únicamente* de datos legacy para migración.
- `supabase/schema.sql`: datos por usuario, política RLS y RPC.

## Límites actuales

- Al estar en cloud-first, para modificar datos necesitas conexión. No hay cola de escritura offline persistente en el navegador: eso sería una función futura, con consentimiento explícito.
- Aun con Supabase, el navegador conserva tokens de autenticación para seguir conectado; **no son registros de progreso**.
- En conflictos entre dos dispositivos, RB suspende la escritura y muestra error; el usuario debe exportar sus cambios no guardados antes de recargar. La fusión automática queda para una etapa posterior.
- La versión 0.3 requiere compilar y verificar en Vercel antes de declararse lista para producción. No está conectada al proyecto real de Supabase hasta que se complete la configuración anterior.

## Publicación directamente en `main` (flujo acordado)

Se utiliza exclusivamente la rama `main` para cambios a partir de RB 0.3. **Un push a `main` puede actualizar la aplicación en Vercel automáticamente**. La versión 0.3 exige Supabase: sin proyecto, SQL, correo de acceso y variables en Vercel, la interfaz de registro permanecerá bloqueada. No publiques antes de completar esta configuración.

1. En la versión 0.2, exporta tu historial a JSON desde Perfil. Guarda el archivo como respaldo fuera del navegador.
2. Crea/configura Supabase: ejecuta `supabase/schema.sql`, activa el proveedor Email y establece las URL de redirección correctas.
3. En Vercel configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para producción.
4. Desde esta carpeta extraída (la de 0.3), ejecuta el script de PowerShell apuntando al repositorio Git original que contiene `.git`:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\publicar-v03-main.ps1" -RepoPath "$HOME\Downloads\RB-v0.2\rb-fitness" -SupabaseConfigurado
```

El script comprueba el remoto `90oso/rb-fitness`, exige que estés en `main` y que el árbol esté limpio, actualiza `main` con `--ff-only`, instala dependencias, prueba ciclos y métricas, comprueba TypeScript, compila Next.js y solo entonces hace commit y push a `main`.

Si falta el parámetro `-SupabaseConfigurado`, **no modificará ni publicará nada**. El parámetro es una confirmación manual del usuario, no una verificación automática de que la base de datos realmente funciona. Después de publicar, verifica login, guardar sesión, reabrir en otro dispositivo y políticas RLS.
