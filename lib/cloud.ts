import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { safeParse } from './storage';
import type { AppData } from './types';

let client: SupabaseClient | null = null;
export function getCloudClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    if (!client)
      client = createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
    return client;
  } catch {
    return null;
  }
}
export interface CloudRecord {
  data: AppData;
  revision: number;
  isNew: boolean;
}
export async function readCloudState(db: SupabaseClient, userId: string): Promise<CloudRecord> {
  const { data, error } = await db
    .from('rb_user_data')
    .select('payload,revision')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(`No se pudo leer el progreso: ${error.message}`);
  if (!data) return { data: (await import('./catalog')).initialData, revision: 0, isNew: true };
  try {
    return { data: safeParse(JSON.stringify(data.payload), true), revision: data.revision, isNew: false };
  } catch {
    throw new Error(
      'La información guardada en la nube no tiene un formato compatible. Exporta una copia antes de migrarla.'
    );
  }
}
export async function writeCloudState(
  db: SupabaseClient,
  payload: AppData,
  expectedRevision: number
): Promise<number> {
  const { data, error } = await db.rpc('rb_save_state', {
    expected_revision: expectedRevision,
    new_payload: { ...payload },
  });
  if (error)
    throw new Error(
      error.code === '40001'
        ? 'El progreso cambió en otro dispositivo. No se sobrescribieron los datos. Vuelve a cargar y revisa los cambios.'
        : `No se pudo guardar: ${error.message}`
    );
  if (typeof data !== 'number') throw new Error('El servidor no confirmó la revisión guardada.');
  return data;
}
