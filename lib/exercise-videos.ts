import type { ExerciseVideo } from './types';

/**
 * Optional short clips, keyed by exercise id (see lib/catalog.ts). While an exercise has no entry here the
 * sheet only shows the two photos plus the «Buscar video» link. To add one:
 *
 *   1. Put the file in public/exercises/<id>/loop.mp4 (H.264, no audio, ≤ 6 s, ≤ 1.5 MB, 3:2 or 4:3).
 *   2. Add `'<id>': { src: '/exercises/<id>/loop.mp4', credit: 'Autor · licencia' },` below.
 *
 * `src` may also be an https URL (for example a public Supabase Storage bucket). `npm run verify` checks that
 * every id exists and that local files are present. Only add clips you recorded yourself or whose license
 * allows redistribution, and always fill `credit`.
 */
export const exerciseVideos: Record<string, ExerciseVideo> = {};
