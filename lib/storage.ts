import { initialData } from './catalog';
import type { AppData } from './types';
const KEY='rb-fitness:v1';
export function safeParse(raw: string): AppData {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') throw new Error('El respaldo no contiene datos válidos.');
  const x=parsed as Record<string,unknown>;
  if (x.version!==1 || !Array.isArray(x.routines) || !Array.isArray(x.workouts) || !x.profile || typeof x.profile !== 'object') throw new Error('El archivo no corresponde al formato RB v1.');
  if (x.routines.length<1 || x.routines.length>100 || x.workouts.length>30000) throw new Error('El archivo supera los límites permitidos.');
  for(const r of x.routines as Record<string,unknown>[]) if(typeof r.id!=='string' || typeof r.name!=='string' || !Array.isArray(r.exercises)) throw new Error('Rutina inválida en el respaldo.');
  for(const w of x.workouts as Record<string,unknown>[]) if(typeof w.id!=='string' || !Array.isArray(w.sets) || typeof w.endedAt!=='string') throw new Error('Sesión inválida en el respaldo.');
  const p=x.profile as Record<string,unknown>;
  if(typeof p.name!=='string' || typeof p.daysPerWeek!=='number' || p.daysPerWeek<1 || p.daysPerWeek>7) throw new Error('Perfil inválido en el respaldo.');
  return {
    ...initialData,
    ...x,
    version:1,
    profile:{...initialData.profile,...p},
    active:null, // a backup never silently resumes an in-progress session
    cycleIndex:Math.max(0,Math.floor(Number(x.cycleIndex)||0)),
    routines:x.routines as AppData['routines'],
    workouts:x.workouts as AppData['workouts'],
    theme:x.theme==='light'?'light':'dark'
  };
}
export function loadData(): AppData {
  if (typeof window==='undefined') return structuredClone(initialData);
  const raw=localStorage.getItem(KEY);
  if (!raw) return structuredClone(initialData);
  try {
    const data=safeParse(raw);
    const full=JSON.parse(raw) as AppData;
    if (full.active && Array.isArray(full.active.sets) && typeof full.active.startedAt==='string') data.active=full.active;
    return data;
  } catch { return structuredClone(initialData); }
}
export function saveData(data: AppData) { localStorage.setItem(KEY,JSON.stringify(data)); }
export function downloadBackup(data: AppData) {
  const date=new Date().toISOString().slice(0,10);
  const blob=new Blob([JSON.stringify({...data,active:null},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`rb-respaldo-${date}.json`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
