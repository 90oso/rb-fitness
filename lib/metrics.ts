import { getExercise, majorMuscles } from './catalog';
import type { AppData, Muscle, SetEntry, Workout } from './types';

export function mondayOf(date: Date): Date {
  const d = new Date(date); d.setHours(0,0,0,0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d;
}
export function weekWorkouts(workouts: Workout[], date = new Date()) {
  const begin = mondayOf(date).getTime();
  return workouts.filter(w => new Date(w.endedAt).getTime() >= begin);
}
export function allSets(workouts: Workout[]): SetEntry[] { return workouts.flatMap(w => w.sets); }
export function setVolume(set: SetEntry) { return set.reps * set.weight; }
export function totalVolume(workouts: Workout[]) { return allSets(workouts).reduce((n,s)=>n+setVolume(s),0); }
export function durationMinutes(w: Workout) { return Math.max(0, Math.round((new Date(w.endedAt).getTime()-new Date(w.startedAt).getTime())/60000)); }
export function weekMetrics(data: AppData) {
  const week = weekWorkouts(data.workouts);
  const sessions = week.length;
  const sets = allSets(week).length;
  const minutes = week.reduce((sum,w)=>sum+durationMinutes(w),0);
  return { sessions, sets, minutes, volume:totalVolume(week), sessionsGoal:data.profile.daysPerWeek, setsGoal:data.profile.daysPerWeek*12, minutesGoal:data.profile.daysPerWeek*45 };
}
export function muscleSets(workouts: Workout[]) {
  const counts = Object.fromEntries(majorMuscles.map(m=>[m,0])) as Record<Muscle,number>;
  for(const s of allSets(workouts)) { const m=getExercise(s.exerciseId)?.muscle; if(m) counts[m] += 1; }
  return counts;
}
export function suggestions(data: AppData) {
  const counts = muscleSets(weekWorkouts(data.workouts));
  const groups = [
    { id:'chest-back', label:'Torso equilibrado', details:'Combina pecho y espalda', score:counts.Pecho+counts.Espalda, exercises:['chest-press','seated-row','lateral-raise','bicep-curl'] },
    { id:'legs-glutes', label:'Piernas y glúteos', details:'Refuerza tu tren inferior', score:counts.Cuádriceps+counts.Femoral+counts.Glúteos, exercises:['leg-press','leg-curl','hip-thrust','calf-raise'] },
    { id:'shoulders-arms', label:'Hombros y brazos', details:'Enfócate en accesorios', score:counts.Hombros+counts.Tríceps+counts.Bíceps, exercises:['shoulder-press','lateral-raise','tricep-pushdown','preacher-curl'] },
  ];
  return groups.sort((a,b)=>a.score-b.score);
}
export function recentSetForExercise(workouts: Workout[], exerciseId: string) {
  const recent = [...workouts].sort((a,b)=> b.endedAt.localeCompare(a.endedAt));
  for (const workout of recent) {
    const sets = workout.sets.filter(s=>s.exerciseId===exerciseId);
    if (sets.length) return sets[sets.length-1];
  }
  return undefined;
}
export function estimatedOneRepMax(set: SetEntry) {
  // Epley formula. Applies to common repetition ranges; an estimate, never a measured 1RM.
  return set.weight * (1 + Math.min(set.reps,30)/30);
}
export function bestEstimatedOneRepMax(workouts: Workout[], exerciseId: string) {
  const candidates = allSets(workouts).filter(s=>s.exerciseId===exerciseId && s.reps > 0 && s.reps <= 12 && s.weight > 0);
  return candidates.length ? Math.max(...candidates.map(estimatedOneRepMax)) : null;
}
export function volumeByWeek(workouts: Workout[], weeks = 6) {
  const now = mondayOf(new Date());
  return Array.from({length:weeks},(_,i)=> {
    const start = new Date(now); start.setDate(now.getDate() - (weeks - i - 1)*7);
    const end = new Date(start); end.setDate(start.getDate()+7);
    const records = workouts.filter(w => { const t=new Date(w.endedAt).getTime(); return t>=start.getTime() && t<end.getTime(); });
    return { label: start.toLocaleDateString('es-PA',{day:'numeric',month:'short'}), volumen:Math.round(totalVolume(records)), sesiones:records.length };
  });
}
export function dayLabel(iso: string) { return new Date(iso).toLocaleDateString('es-PA',{day:'numeric',month:'short',year:'numeric'}); }
export function prettyDuration(s: number) { const n=Math.max(0,Math.ceil(s)); return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; }
export function uid() { return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
