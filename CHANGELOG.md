# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/). Versionado semántico.

## [0.8.0] — 2026-11-06

### Cambiado

- **Nuevo estilo «Cristal» en toda la app** (reemplaza la capa «Stars»): paneles translúcidos con desenfoque del fondo, borde fino y brillo en el canto superior, sobre una malla de degradados con grano fino (sin círculos). Redondeo medio con jerarquía (panel 18 px, tarjetas y botones 14 px, campos 12 px, chips 10 px, etiquetas 7 px); la navegación inferior en cápsula es lo único totalmente redondo. Acción principal en amarillo, acento en rojo; titulares y cifras en Barlow, y Barlow Condensed en mayúsculas solo en botones y etiquetas. Aplica a acceso, Hoy, Entrenar, Progreso, Ejercicios, Perfil, sesión activa, modales, avisos y /privacidad, en claro y oscuro.
- **Hoy rediseñado, con la próxima sesión primero**: saludo, tarjeta de la próxima sesión con un único botón de acción, dos fichas de la semana (anillo de sesiones y volumen con su tendencia real de las últimas semanas) y el ciclo en carrusel. El número del día aparece enorme y en contorno detrás del cristal. En escritorio la próxima sesión y las fichas de la semana van en dos columnas.
- La barra superior **se esconde al bajar y reaparece al subir** (solo en móvil), y vuelve a mostrarse al cambiar de pestaña, abrir una ventana o enfocarla con el teclado. La franja bajo la barra de estado del iPhone queda siempre oscura (`.statusbar-scrim`).
- Gráfica de volumen y avisos usan los colores del tema (barra roja en claro, amarilla en oscuro).
- Estado de sincronización con etiqueta propia.
- **Móvil, menos denso y sin superposiciones**: la barra inferior y la superior son más opacas, y un degradado desvanece el contenido antes de llegar a la barra inferior (ya no se ve el texto pasando por debajo). Se quitan elementos repetidos o decorativos: la etiqueta «Listo» de la barra superior, el renglón de ejercicios del hero de Hoy, los rótulos pequeños sobre cada título, el icono de cada rutina, el icono de cada estadística, el texto «Ver cómo se hace» repetido en cada ejercicio y el párrafo de «Diseña tu propio ciclo». Las rutinas muestran 2 ejercicios y «+N más»; Hoy separa más sus secciones. Además, la escala en móvil es más liviana: títulos y cifras un paso más pequeños y con menos grosor, márgenes laterales de 20 px, tarjetas con más aire interno, botones y barra inferior más compactos, y la cifra gigante de fondo en Hoy más discreta.

### Corregido

- En el carrusel «Tu ciclo» la primera tarjeta ya no queda pegada al borde (`scroll-padding-inline` igual al margen de la página) y en tabletas y escritorio las tarjetas se reparten el ancho en lugar de dejar cinco columnas fijas.
- «-1 min transcurridos» al empezar una sesión: el tiempo transcurrido nunca es negativo.

### Eliminado

- `components/rings.tsx` (tres anillos), el saludo gigante, las cintas y rayas, las esquinas cortadas, las manchas redondas de fondo y la barra de progreso de scroll del estilo anterior; también las reglas de CSS de Hoy que ya no se usan.

## [0.7.0] — 2026-11-02

### Añadido

- **Eliminar mi cuenta** en Perfil: pide escribir «ELIMINAR», borra de forma definitiva la cuenta, el perfil, las rutinas y el historial (RPC `rb_delete_account`, `SECURITY DEFINER`, solo sobre `auth.uid()`; `rb_user_data` se borra en cascada), cierra la sesión del dispositivo, olvida el correo recordado y avisa en la pantalla de acceso. Requisito de Google Play y App Store.
- Página **/privacidad** (qué datos se guardan, proveedores, derechos, cómo eliminar la cuenta), enlazada desde el acceso y desde Perfil → Cuenta. Correo de contacto opcional vía `NEXT_PUBLIC_CONTACT_EMAIL`.
- `ConfirmDialog` admite `requireText` para acciones irreversibles.
- `lib/remembered-email.ts` (el correo recordado, antes dentro de `auth-screen.tsx`).

### Cambiado

- Service worker (`rb-shell-v6`): cada página navegable se guarda con clave propia; visitar `/privacidad` ya no puede reemplazar el shell de la app guardado para modo sin conexión.
- `signOut` acepta `scope` (`'local'` tras eliminar la cuenta) y siempre limpia el estado aunque el servidor falle.
- Perfil: «Borrar historial y rutinas» y «Eliminar mi cuenta» quedan apilados en la tarjeta de datos.

## [0.6.0] — 2026-11-02

### Añadido

- **Video como opción** en la ficha de cada ejercicio: botón «Buscar video» (YouTube, pestaña nueva) para los 100 ejercicios y, cuando hay un clip registrado en `lib/exercise-videos.ts`, pestañas Fotos/Video con reproductor integrado (`preload="none"`, sin audio por defecto, con la foto inicial como póster) y crédito propio.
- `ExerciseVideo` (`src`, `credit`) en `lib/types.ts`; `lib/video.ts` con el enlace de búsqueda; comprobación en `npm run verify` de que cada clip registrado apunta a un ejercicio real y a un archivo existente.

### Cambiado

- El service worker no intercepta videos ni peticiones con `Range` (caché `rb-shell-v5`).
- README: sección «Videos de ejercicios»; se elimina la guía de importación de historial, que ya no existe desde 0.4.

## [0.5.0] — 2026-11-02

### Añadido

- Catálogo de **100 ejercicios** (antes 19) curado para el equipo habitual de Planet Fitness: máquinas selectorizadas, poleas, mancuernas, Smith y peso corporal, con nombre, instrucción y consejo en español.
- Cada ejercicio tiene **dos fotos (posición inicial y final)** que se alternan como guía de movimiento en la ficha; miniaturas en la biblioteca, en el selector de ejercicios, en el editor de rutinas y en la sesión activa («Ver cómo se hace»). Imágenes de Free Exercise DB (dominio público), optimizadas a WebP de 640 px; créditos en `public/exercises/CREDITS.md`.
- Filtro por tipo de equipo en la biblioteca, además del filtro por músculo.
- Campo `media` en `Exercise` (fotogramas, video opcional, origen).

## [0.4.0] — 2026-11-01

### Añadido

- Acceso con **correo y contraseña** (crear cuenta, entrar, recuperar contraseña, nueva contraseña desde el enlace de recuperación). Sustituye al enlace mágico, que chocaba con el límite de 2 correos/hora del SMTP integrado de Supabase.
- La sesión queda guardada en el dispositivo hasta cerrar sesión (token con refresco automático).
- Botón de **tema** (claro/oscuro) en la barra superior y en la pantalla de acceso; opción «Sistema» en Perfil. La app inicia en **modo claro** por defecto; la preferencia se guarda en el dispositivo y se aplica antes de pintar: sin parpadeo al cargar.
- Diálogo de confirmación propio (`ConfirmDialog`) en lugar de `window.confirm()`.
- ESLint (config de Next 16) y Prettier, con `npm run lint`, `npm run format` y `npm run verify`; CI ejecuta lint y formato.
- `scripts/dev/mock-supabase.mjs`: Supabase simulado en memoria para pruebas locales sin proyecto real.
- `viewportFit: cover` y `apple-touch-icon` para la PWA en iOS.

### Cambiado

- Acceso con una sola acción primaria (Entrar); «Crear cuenta» y «¿Olvidaste tu contraseña?» como enlaces secundarios. El último correo usado queda recordado en el dispositivo y aparece prellenado.
- Editor de rutinas rediseñado como hoja con borrador y botones Guardar/Cancelar: una tarjeta por ejercicio con controles −/+ (series, repeticiones, descanso), subir/bajar/quitar, y un selector con búsqueda y filtros por músculo para añadir ejercicios.
- Perfil simplificado: desaparecen «Importar historial anterior» e «Importar JSON» (los datos viven en la cuenta); «Descargar una copia de mis datos» pasa a la tarjeta Cuenta.
- `components/rb-app.tsx` dividido en hooks (`useAuth`, `useCloudSync`, `useTheme`, `useConfirm`, `useToast`), vistas por pestaña, modales y shell.
- El guardado en la nube se agrupa con un retardo de 600 ms (`SAVE_DEBOUNCE_MS`): escribir en el perfil ya no envía una petición por tecla. Si la pestaña pasa a segundo plano con cambios pendientes, se envían de inmediato.
- Pantalla de acceso rediseñada: fondo con formas de color en movimiento, tarjeta que aparece al entrar, selector Entrar/Crear cuenta deslizante, campos con foco animado, texto mínimo. Las animaciones respetan `prefers-reduced-motion`.
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
