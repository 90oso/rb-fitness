# RB Fitness — MVP 0.2

Aplicación de seguimiento de entrenamientos, **mobile first**, desarrollada con **Next.js (App Router), React, TypeScript, Tailwind, Lucide y Recharts**. Preparada para despliegue en **Vercel**. Inspirada visualmente en el dashboard PULSE compartido, adaptada al proyecto RB.

## Qué funciona

- Panel con progreso **real** (sesiones, series, minutos y volumen semanal). No contiene métricas fisiológicas inventadas.
- Rutina inicial editable: empuje, tracción, descanso, piernas y día flexible.
- Sesiones activas, captura rápida de peso y repeticiones, temporizador de descanso, reanudación al recargar y guardar sesión.
- Último peso y repeticiones visibles por ejercicio, con sugerencia conservadora de progresión cuando se completan las series y repeticiones objetivo.
- Historial con detalle y opción de eliminar sesiones, gráficas de volumen, series por músculo y 1RM aproximado.
- Día flexible con tres propuestas basadas en series registradas esa semana (no IA).
- Biblioteca con instrucciones generales para máquinas y ejercicios típicos de Planet Fitness.
- Perfil, metas, gimnasio, unidades kg/lb y modos claro/oscuro.
- Persistencia local (`localStorage`) y respaldo JSON con importación y exportación.
- Manifest PWA, iconos 192/512, service worker sencillo para cachear shell en producción.

## Desarrollo local

Requisitos: Node.js 20.9+ (recomendado Node 22) y npm.

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`. Para verificar el paquete:

```bash
npm run test:metrics
npm run typecheck
npm run build
```

## Publicar en Vercel

1. Crear repositorio **privado** nuevo en GitHub, por ejemplo `90oso/rb-fitness`, y subir los archivos del proyecto (sin carpetas `node_modules` ni `.next`). Si usas Windows y tienes GitHub CLI (`gh`) autenticado, puedes ejecutar desde PowerShell: `./scripts/publicar-github.ps1`. El script verifica Git, autenticación y remoto, y no hace `push --force`.
2. Abrir Vercel -> **Add New -> Project** -> importar el repositorio.
3. Framework: **Next.js** (detección automática). Root Directory: `/`.
4. Publicar usando **Deploy**. No hay variables de entorno obligatorias en esta versión.
5. En Android/Chrome, usar menú **Instalar aplicación** o **Añadir a pantalla de inicio**. En iPhone/Safari usar **Compartir -> Añadir a pantalla de inicio**.

### Advertencia sobre el almacenamiento

Esta versión usa `localStorage` y NO sincroniza entre dispositivos. Si borras los datos del navegador, pierdes tus registros salvo que tengas un respaldo JSON. La exportación es especialmente importante si la instalas como PWA. No almacenes aquí datos médicos sensibles. Se incluye un esquema SQL `supabase/schema.sql` solo como punto de partida para una versión multiusuario con Supabase Auth y políticas RLS; **Supabase no está conectado todavía**.

### Sobre el uso sin conexión

El service worker cachea la página inicial y los recursos visitados. La instalación offline y las actualizaciones de la caché deben validarse en el dispositivo y navegador final. No se ofrece garantía de sincronización offline/online porque no hay backend conectado.

## Lógica

- Sesiones semanales: lunes a domingo, calculadas en la zona local del dispositivo.
- El volumen se muestra en **kg·rep**: peso registrado (kg) × repeticiones. Esto no equivale a calorías, ni a gasto energético. En ejercicios con peso corporal cero, el volumen de carga externa será cero.
- 1RM estimado: fórmula de Epley, calculada solo para series de 1–12 repeticiones con peso adicional registrado.
- Progresión: cuando la última sesión de un ejercicio alcanzó todas las series objetivo con repeticiones al máximo del rango y el mismo peso, calcula un aumento orientativo cercano al 2.5% (redondeado a pasos de 0.5 kg); el usuario decide si su máquina y técnica lo permiten. No es una prescripción clínica.
- Día flexible: compara el número de series por grandes grupos; la sugerencia con menos series totales aparece primero. Es una **heurística exploratoria**, no una prescripción deportiva.
- Cambio de unidades kg/lb: los datos se almacenan internamente en kg y se convierten para mostrar/capturar en lb.
- Descanso: es una etapa del ciclo, marcada manualmente; no produce sesión de entrenamiento.

## Arquitectura

```
app/                 Layout, pantalla, manifest PWA y estilos
components/rb-app.tsx UI, navegación, eventos y lógica de interacción
components/rings.tsx   Anillos de metas semanales
components/volume-chart.tsx Gráfica Recharts
lib/types.ts         Contratos de datos
lib/catalog.ts       Catálogo y rutinas predeterminadas
lib/metrics.ts       Cálculos puros
lib/storage.ts       Persistencia y respaldo
public/sw.js         Caché básica PWA
supabase/schema.sql  Esquema futuro (NO conectado)
```

## Próxima fase

Dividir `rb-app.tsx` en módulos y agregar tests automatizados (funciones puras y E2E), migrar almacenamiento a IndexedDB si aumenta el volumen de registros, habilitar Supabase Auth + sync por usuario, añadir ilustraciones específicas verificadas de máquinas, integrar analíticas/coach IA con endpoints del lado servidor y políticas de privacidad apropiadas.

**Estado de verificación**: 19 comprobaciones de lógica, progresión y respaldo superadas, además de revisión sintáctica de los archivos TS/TSX. **No se ha ejecutado `next build`** porque el entorno de construcción no tiene acceso al registro de npm. Se incluye CI de GitHub para probar el paquete en un entorno conectado.

**Nota**: fuente generada en un entorno sin acceso a npm registry; compilar y validar en un entorno con `npm install` antes de llamar a la versión lista para producción.
