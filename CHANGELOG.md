# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/). Versionado semántico.

## [0.4.0] — 2026-11-01

### Añadido

- Acceso con **correo y contraseña** (crear cuenta, entrar, recuperar contraseña, nueva contraseña desde el enlace de recuperación). Sustituye al enlace mágico, que chocaba con el límite de 2 correos/hora del SMTP integrado de Supabase.
- La sesión queda guardada en el dispositivo hasta cerrar sesión (token con refresco automático).
- Botón de **tema** (oscuro/claro) en la barra superior y en la pantalla de acceso; opción «Sistema» en Perfil. La preferencia se guarda en el dispositivo y se aplica antes de pintar: sin parpadeo al cargar.
- Diálogo de confirmación propio (`ConfirmDialog`) en lugar de `window.confirm()`.
- ESLint (config de Next 16) y Prettier, con `npm run lint`, `npm run format` y `npm run verify`; CI ejecuta lint y formato.
- `scripts/dev/mock-supabase.mjs`: Supabase simulado en memoria para pruebas locales sin proyecto real.
- `viewportFit: cover` y `apple-touch-icon` para la PWA en iOS.

### Cambiado

- `components/rb-app.tsx` dividido en hooks (`useAuth`, `useCloudSync`, `useTheme`, `useConfirm`, `useToast`), vistas por pestaña, modales y shell.
- El guardado en la nube se agrupa con un retardo de 600 ms (`SAVE_DEBOUNCE_MS`): escribir en el perfil ya no envía una petición por tecla. Si la pestaña pasa a segundo plano con cambios pendientes, se envían de inmediato.
- Pantalla de acceso con el mismo estilo que la app (tokens de tema, tarjeta, fondos ambientales, botón lima).
- Texto en lima legible en tema claro (`--acid-ink`).
- Código formateado con Prettier (líneas largas eliminadas).

### Eliminado

- Tailwind CSS (no se usaba ninguna utilidad y su clase `.overline` subrayaba por arriba las etiquetas). El reset necesario vive ahora en `app/globals.css`.
- `components/cloud-gate.tsx` (acceso por enlace mágico).

### Notas de migración

- En Supabase: Authentication → Providers → Email debe tener habilitado el acceso con contraseña. Decide si «Confirm email» queda encendido (recomendado en producción, requiere SMTP propio) o apagado durante las pruebas.
- `AppData.theme` se conserva por compatibilidad con respaldos 0.3 pero ya no se escribe; el tema vive en `localStorage` (`rb-theme`).

## [0.3.0] — 2026-10-30

- Ciclos personalizados (crear, duplicar, reordenar, eliminar días) y progreso guardado en Supabase por usuario con control de revisión.

## [0.2.0] — 2026-10-29

- MVP local con registro de series, temporizador de descanso, métricas y respaldo JSON.
