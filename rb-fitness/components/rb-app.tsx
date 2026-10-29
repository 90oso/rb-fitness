'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, BarChart3, BookOpen,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, Download,
  Dumbbell, Flame, HeartPulse, Home, Info, Minus, Moon, MoreHorizontal, Pencil, Play, Plus,
  RotateCcw, Search, Settings2, ShieldCheck, Sparkles, Sun, Target, Timer, Trash2, TrendingUp,
  Trophy, Upload, UserRound, Waves, X
} from 'lucide-react';
import Rings from './rings';
import VolumeChart from './volume-chart';
import { catalog, getExercise, initialData, majorMuscles } from '@/lib/catalog';
import { allSets, bestEstimatedOneRepMax, dayLabel, durationMinutes, muscleSets, prettyDuration, progressionAdvice, recentSetForExercise, suggestions, totalVolume, uid, volumeByWeek, weekMetrics, weekWorkouts } from '@/lib/metrics';
import { downloadBackup, loadData, safeParse, saveData } from '@/lib/storage';
import type { AppData, Exercise, Routine, RoutineExercise, Workout } from '@/lib/types';

type Tab = 'today'|'train'|'progress'|'library'|'profile';
const nav = [
  {id:'today' as Tab,label:'Hoy',icon:Home},
  {id:'train' as Tab,label:'Entrenar',icon:Dumbbell},
  {id:'progress' as Tab,label:'Progreso',icon:BarChart3},
  {id:'library' as Tab,label:'Ejercicios',icon:BookOpen}
];
const D = (n:number)=> Number.isFinite(n) ? n.toLocaleString('es-PA',{maximumFractionDigits:1}) : '0';
const pct=(a:number,b:number)=>Math.round(Math.max(0,Math.min(100,b?100*a/b:0)));
const fmt=(date:Date)=>date.toLocaleDateString('es-PA',{weekday:'long',day:'numeric',month:'long'});
const makeRx=(id:string):RoutineExercise=>({exerciseId:id,targetSets:3,minReps:8,maxReps:12,restSeconds:90});

export default function RBApp() {
  const [data,setData]=useState<AppData>(initialData);
  const [hydrated,setHydrated]=useState(false);
  const [tab,setTab]=useState<Tab>('today');
  const [notice,setNotice]=useState<string|null>(null);
  const [now,setNow]=useState(Date.now());
  const [restEnd,setRestEnd]=useState<number|null>(null);
  const [selectedExercise,setSelectedExercise]=useState<string>('');
  const [weight,setWeight]=useState<number>(0);
  const [reps,setReps]=useState<number>(10);
  const [search,setSearch]=useState('');
  const [muscleFilter,setMuscleFilter]=useState<string>('Todos');
  const [detailId,setDetailId]=useState<string|null>(null);
  const [editingRoutine,setEditingRoutine]=useState<string|null>(null);
  const [expandedHistory,setExpandedHistory]=useState<string|null>(null);
  const [showAllSessions,setShowAllSessions]=useState(false);
  const fileInput=useRef<HTMLInputElement|null>(null);
  const toastTimeout=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{ setData(loadData()); setHydrated(true); },[]);
  useEffect(()=>{ if(hydrated){try{saveData(data);}catch{setNotice('Sin espacio de almacenamiento: exporta un respaldo.');}} },[data,hydrated]);
  useEffect(()=>{ document.documentElement.dataset.theme=data.theme; },[data.theme]);
  useEffect(()=>{ if(!data.active) return; const timer=setInterval(()=>setNow(Date.now()),1000); return()=>clearInterval(timer); },[data.active]);
  useEffect(()=>{if(!restEnd)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[restEnd]);
  useEffect(()=>{ if(restEnd && restEnd<=now) setRestEnd(null); },[now,restEnd]);
  useEffect(()=>{if('serviceWorker' in navigator && process.env.NODE_ENV==='production') navigator.serviceWorker.register('/sw.js').catch(()=>{});},[]);
  const toast=(message:string)=>{setNotice(message); if(toastTimeout.current) clearTimeout(toastTimeout.current);toastTimeout.current=setTimeout(()=>setNotice(null),3400);};
  const unit=data.profile.weightUnit;
  const fromKg=(kg:number)=>unit==='kg'?kg:kg*2.2046226218;
  const toKg=(v:number)=>unit==='kg'?v:v/2.2046226218;
  const routines=data.routines;
  const nextRoutine=routines[data.cycleIndex%routines.length]||routines[0];
  const activeRoutine=routines.find(r=>r.id===data.active?.routineId);
  const metrics=useMemo(()=>weekMetrics(data),[data]);
  const trend=useMemo(()=>volumeByWeek(data.workouts),[data.workouts]);
  const suggestionList=useMemo(()=>suggestions(data),[data]);
  const latest=[...data.workouts].sort((a,b)=>b.endedAt.localeCompare(a.endedAt));
  const totalSessions=data.workouts.length;
  const totalSets=allSets(data.workouts).length;
  const currentCount=data.active?.sets.filter(s=>s.exerciseId===selectedExercise).length||0;
  const currentRx=activeRoutine?.exercises.find(e=>e.exerciseId===selectedExercise);
  const currentEx=getExercise(selectedExercise);
  const previousSet=recentSetForExercise(data.workouts,selectedExercise);
  const progression = currentRx ? progressionAdvice(data.workouts, selectedExercise, currentRx.targetSets, currentRx.maxReps) : null;
  const showUnit=(n:number)=>`${D(fromKg(n))} ${unit}`;

  function startWorkout(routineId:string) {
    if(data.active){setTab('train');toast('Ya tienes una sesión en curso.');return;}
    const routine=routines.find(r=>r.id===routineId);
    if(!routine || routine.isRest){toast('Selecciona un entrenamiento.');return;}
    const first=routine.exercises[0]?.exerciseId||'';
    setSelectedExercise(first);
    const old=recentSetForExercise(data.workouts,first);
    setWeight(old?Number(fromKg(old.weight).toFixed(1)):0);setReps(old?.reps||10);
    setData(d=>({...d,active:{id:uid(),routineId,startedAt:new Date().toISOString(),sets:[]}}));
    setTab('train');setRestEnd(null);
  }
  function selectExercise(id:string) {
    setSelectedExercise(id);
    const prev=recentSetForExercise(data.workouts,id);
    const inCurrent=data.active?.sets.filter(s=>s.exerciseId===id).at(-1);
    setWeight(inCurrent ? Number(fromKg(inCurrent.weight).toFixed(1)) : prev ? Number(fromKg(prev.weight).toFixed(1)) : 0);
    setReps(inCurrent?.reps||prev?.reps||10);
  }
  function saveSet() {
    if(!data.active || !currentEx || !Number.isFinite(weight) || weight<0 || toKg(weight)>3000 || !Number.isInteger(reps) || reps<1 || reps>100){toast('Revisa el peso y las repeticiones.');return;}
    const entry={id:uid(),exerciseId:selectedExercise,reps,weight:toKg(weight),performedAt:new Date().toISOString()};
    setData(d=>({...d,active:d.active ? {...d.active,sets:[...d.active.sets,entry]}:null}));
    setRestEnd(Date.now()+(currentRx?.restSeconds||90)*1000);
    toast('Serie registrada. Buen trabajo.');
  }
  function deleteSet(id:string) {
    setData(d=>({...d,active:d.active?{...d.active,sets:d.active.sets.filter(s=>s.id!==id)}:null}));
    toast('Serie eliminada.');
  }
  function finishWorkout() {
    if(!data.active)return;
    if(!data.active.sets.length){toast('Registra al menos una serie para completar.');return;}
    const routine=routines.find(r=>r.id===data.active?.routineId);
    const finished:Workout={id:data.active.id,routineId:data.active.routineId,routineName:routine?.name||'Entrenamiento',startedAt:data.active.startedAt,endedAt:new Date().toISOString(),sets:data.active.sets};
    setData(d=>({...d,workouts:[...d.workouts,finished],active:null,cycleIndex:(Math.max(0,d.routines.findIndex(r=>r.id===finished.routineId))+1)%Math.max(1,d.routines.length)}));
    setRestEnd(null);setTab('progress');toast('¡Sesión guardada en tu historial!');
  }
  function discardWorkout() {
    if(!window.confirm('¿Descartar esta sesión? Las series no se guardarán.')) return;
    setData(d=>({...d,active:null}));setRestEnd(null);setTab('today');
  }
  function markRest(){setData(d=>({...d,cycleIndex:(d.cycleIndex+1)%Math.max(1,d.routines.length),lastRestDate:new Date().toISOString()}));toast('Descanso registrado. Tu ciclo continúa.');}
  function skipTo(index:number){if(data.active){toast('Finaliza tu sesión activa antes de cambiar el ciclo.');return;}setData(d=>({...d,cycleIndex:index}));setTab('today');}
  function applyFlexible(exercises:string[]){setData(d=>({...d,routines:d.routines.map(r=>r.id==='flex'?{...r,exercises:exercises.map(id=>makeRx(id))}:r)}));toast('Propuesta aplicada a tu Día 5. Puedes editarla.');}
  function removeWorkout(id:string){if(!confirm('¿Eliminar esta sesión del historial? No se puede deshacer.'))return;setData(d=>({...d,workouts:d.workouts.filter(w=>w.id!==id)}));toast('Sesión eliminada.');}
  function editRoutine(routineId:string,update:(r:Routine)=>Routine){setData(d=>({...d,routines:d.routines.map(r=>r.id===routineId?update(r):r)}));}
  async function importBackup(file:File){
    if(file.size>10*1024*1024){toast('El respaldo supera 10 MB.');return;}
    try{const parsed=safeParse(await file.text());if(!confirm('¿Reemplazar todas las rutinas y sesiones locales con las del respaldo?'))return;setData(parsed);setTab('today');setEditingRoutine(null);toast('Respaldo importado.');}
    catch(e){toast(e instanceof Error?e.message:'No se pudo importar el respaldo.');}
    finally{if(fileInput.current)fileInput.current.value='';}
  }
  function resetAll(){if(!confirm('Esto eliminará TODO tu historial y tus rutinas locales. ¿Continuar?'))return;if(!confirm('Última confirmación: ¿borrar todos los datos de RB?'))return;setData(structuredClone(initialData));setTab('today');toast('Datos locales reiniciados.');}
  const greet = new Date(now).getHours()<12?'Buenos días':new Date(now).getHours()<19?'Buenas tardes':'Buenas noches';
  const shortName=data.profile.name.trim().split(/\s+/)[0]||'Atleta';

  return <div className="app-root">
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <aside className="sidebar">
      <div className="brand-xl"><div className="brand-icon">RB<span className="brand-dot"/></div><div><div className="brand-title">RB<span className="brand-title-dot">.</span></div><div className="brand-caption">FITNESS TRACKER</div></div></div>
      <div className="aside-label">TU ESPACIO</div>
      {nav.map(({id,label,icon:Icon})=><button key={id} className={`aside-link ${tab===id?'selected':''}`} onClick={()=>setTab(id)}><Icon size={19}/>{label}{tab===id&&<span className="aside-active-dot"/>}</button>)}
      <div className="aside-label aside-gap">CONFIGURACIÓN</div>
      <button className={`aside-link ${tab==='profile'?'selected':''}`} onClick={()=>setTab('profile')}><Settings2 size={19}/> Perfil y ajustes</button>
      <div className="sidebar-bottom"><span className="sidebar-icon"><Activity size={19}/></span><div><strong>Un día a la vez.</strong><small>El progreso se construye.</small></div></div>
    </aside>
    <div className="content-shell">
      <header className="topbar">
        <button className="mobile-brand" aria-label="Volver al inicio" onClick={()=>setTab('today')}><span className="mark">RB</span><span className="mobile-brand-text">FITNESS <b>•</b></span></button>
        <div className="desktop-crumb"><span>RB FITNESS</span><ChevronRight size={15}/><strong>{({today:'Mi día',train:'Entrenar',progress:'Progreso',library:'Biblioteca',profile:'Mi perfil'} as const)[tab]}</strong></div>
        <div className="top-actions"><span className="activity-pill"><span className="blip"/> {data.active?'EN SESIÓN':'LISTO PARA ENTRENAR'}</span><button className="avatar" onClick={()=>setTab('profile')} title="Abrir perfil"><UserRound size={20}/></button></div>
      </header>
      <main className="main-content">
        {!hydrated ? <div className="loading">Cargando tu espacio RB...</div> : <>
          {tab==='today' && <>
            <div className="eyebrow-line"><span>{fmt(new Date(now)).toUpperCase()}</span><span className="eyebrow-spark">✦ TU PROPIO RITMO</span></div>
            <div className="welcome"><div><span className="overline">TU ESPACIO DE ENTRENAMIENTO</span><h1>{greet},<br/><span>{shortName}.</span></h1><p>El próximo nivel empieza con una serie más.</p></div><span className="header-flourish"><Activity size={31}/></span></div>
            <section className="dashboard-grid">
              <div className="card activity-card">
                <div className="card-top"><span className="section-label"><span className="lime-point"/> TU OBJETIVO SEMANAL</span><span className="metric-badge">{pct(metrics.sessions,metrics.sessionsGoal)}% COMPLETADO</span></div>
                <div className="ring-content"><Rings values={[
                  {label:'Sesiones',current:metrics.sessions,goal:metrics.sessionsGoal,color:'#C3F400'},
                  {label:'Series',current:metrics.sets,goal:metrics.setsGoal,color:'#00E5ED'},
                  {label:'Minutos',current:metrics.minutes,goal:metrics.minutesGoal,color:'#FFA9BA'}
                ]}/>
                <div className="ring-legend"><div><i style={{background:'#C3F400'}}/><span>Sesiones</span><strong>{metrics.sessions}<small> / {metrics.sessionsGoal}</small></strong></div><div><i style={{background:'#00E5ED'}}/><span>Series</span><strong>{metrics.sets}<small> / {metrics.setsGoal}</small></strong></div><div><i style={{background:'#FFA9BA'}}/><span>Minutos</span><strong>{metrics.minutes}<small> / {metrics.minutesGoal}</small></strong></div></div></div>
                <p className="card-footnote">Objetivos orientativos configurados según tus días de entrenamiento.</p>
              </div>
              <div className="card status-card">
                <div className="card-top"><span className="section-label"><Activity size={15} className="lime-text"/> TU RENDIMIENTO</span><span className="status-tag">DATOS REALES</span></div>
                <div className="performance-stat"><strong>{D(metrics.volume)}</strong><span>kg·rep de volumen esta semana</span></div>
                <svg viewBox="0 0 390 68" className="wave-line" role="img" aria-label="Decoración de línea de rendimiento"><defs><linearGradient id="glow-wave"><stop stopColor="#C3F400"/><stop offset="1" stopColor="#00E5ED"/></linearGradient></defs><path d="M0 39 H57 l12 -15 10 30 15 -22 12 7 H215 l13 -25 12 40 14 -29 12 14 H390" fill="none" stroke="url(#glow-wave)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="performance-duo"><div><Trophy size={17}/><small>Sesiones totales</small><strong>{totalSessions}</strong></div><div><Dumbbell size={17}/><small>Series registradas</small><strong>{totalSets}</strong></div></div>
              </div>
              <div className="card session-card"><div className="card-top"><span className="section-label">TU PRÓXIMA SESIÓN</span><span className="today-chip">{nextRoutine?.isRest?'RECUPERACIÓN':'SIGUIENTE'}</span></div>
                <div className="up-next-row"><div><div className="training-kicker">{nextRoutine?.tag}</div><h2>{nextRoutine?.name}</h2><p><Clock3 size={16}/> {nextRoutine?.isRest?'Recupera energía para el próximo entrenamiento':`${nextRoutine?.exercises.length} ejercicios · ${data.profile.gym}`}</p></div>
                <button className="primary-circle" onClick={()=>data.active?setTab('train'):nextRoutine?.isRest?markRest():startWorkout(nextRoutine.id)}>{data.active?'Continuar':nextRoutine?.isRest?'Listo':'Empezar'}<ArrowRight size={17}/></button></div>
              </div>
              <div className="card quick-card"><div className="card-top"><span className="section-label">UN VISTAZO</span><ArrowUpRight size={17} className="muted"/></div><div className="mini-stats"><div><span className="mini-icon cyan"><CalendarDays size={20}/></span><small>Esta semana</small><strong>{metrics.sessions} <em>sesiones</em></strong></div><div><span className="mini-icon lime"><Target size={20}/></span><small>Objetivo</small><strong>{metrics.sessionsGoal} <em>sesiones</em></strong></div></div></div>
            </section>
            <section className="below-grid"><div className="section-heading"><div><span className="overline">LO QUE VIENE</span><h2>Tu ciclo de entrenamiento</h2></div><button className="text-link" onClick={()=>setTab('train')}>Ver rutinas <ArrowRight size={15}/></button></div><div className="cycle-scroller">{routines.map((r,i)=><button key={r.id} className={`cycle-card ${nextRoutine.id===r.id?'cycle-current':''}`} onClick={()=>skipTo(i)}><span className="cycle-day">DÍA {i+1} {nextRoutine.id===r.id&&<span>• SIGUIENTE</span>}</span><span className="cycle-icon">{r.isRest?<Waves size={23}/>:<Dumbbell size={23}/>}</span><strong>{r.name}</strong><small>{r.isRest?'Descanso':`${r.exercises.length} ejercicios`}</small></button>)}</div></section>
            {totalSessions===0&&<div className="first-tip"><Sparkles size={19}/><div><strong>Todo gran progreso empieza en cero.</strong><span>Inicia tu primera sesión y verás tus estadísticas completarse automáticamente.</span></div></div>}
          </>}
          {tab==='train' && <>
            {!data.active ? <>
              <PageHead overline="TU PLAN PERSONAL" title="Entrena a tu manera." sub="Sigue tu ciclo o elige una rutina. Puedes modificar cada ejercicio y sus objetivos."/>
              {nextRoutine.isRest&&<div className="card rest-banner"><Waves size={25}/><div><strong>Tu siguiente etapa es descanso</strong><p>El ciclo incluye recuperación. No se contabiliza como entrenamiento.</p></div><button className="small-primary" onClick={markRest}>Marcar descanso <Check size={17}/></button></div>}
              <div className="routine-grid">{routines.filter(r=>!r.isRest).map((r,i)=><div className="card routine-tile" key={r.id}><div className="routine-top"><span className="routine-index">{String(i+1).padStart(2,'0')}</span><span className="routine-tag">{r.tag}</span></div><div className="routine-glyph"><Dumbbell size={28}/></div><h2>{r.name}</h2><p>{r.subtitle} · {r.exercises.length} ejercicios</p><div className="routine-previews">{r.exercises.slice(0,3).map(e=><span key={e.exerciseId}>{getExercise(e.exerciseId)?.name}</span>)}{r.exercises.length>3&&<span>+ {r.exercises.length-3} más</span>}</div><div className="routine-actions"><button className="secondary-btn" onClick={()=>setEditingRoutine(r.id)}><Pencil size={16}/> Editar</button><button className="lime-btn" onClick={()=>startWorkout(r.id)}><Play size={16}/> Empezar</button></div></div>)}</div>
              {nextRoutine.id==='flex'&&<div className="card suggestion-block"><div className="section-heading"><div><span className="overline">RB TE SUGIERE</span><h2>Tu día flexible</h2></div><Sparkles size={24} className="lime-text"/></div><p>Ordenado por menor número de series registradas esta semana en cada grupo de músculos. Tú eliges.</p><div className="suggestions">{suggestionList.map((s,i)=><div key={s.id} className="suggestion"><span className="suggestion-num">{i+1}</span><div><strong>{s.label}</strong><small>{s.details} · {s.score} series recientes</small></div><button onClick={()=>applyFlexible(s.exercises)}>Elegir <ChevronRight size={15}/></button></div>)}</div></div>}
            </> : <>
              <div className="session-header"><div><span className="overline session-status"><span className="blip"/> SESIÓN EN CURSO</span><h1>{activeRoutine?.name}</h1><p><Clock3 size={15}/> {Math.floor((now-new Date(data.active.startedAt).getTime())/60000)} min transcurridos <span>·</span> {data.active.sets.length} series registradas</p></div><button className="icon-action" onClick={discardWorkout} title="Descartar sesión"><X size={22}/></button></div>
              <div className="active-layout"><section className="card current-exercise"><div className="card-top"><span className="section-label">EJERCICIO ACTUAL</span><span className="routine-tag">{activeRoutine?.tag}</span></div>
                <div className="exercise-choices">{activeRoutine?.exercises.map((rx,i)=><button key={rx.exerciseId} onClick={()=>selectExercise(rx.exerciseId)} className={`exercise-choice ${selectedExercise===rx.exerciseId?'active':''}`}><span>{i+1}</span><span>{getExercise(rx.exerciseId)?.name}</span><strong>{data.active!.sets.filter(s=>s.exerciseId===rx.exerciseId).length}/{rx.targetSets}</strong></button>)}</div>
              </section>
              <section className="card log-card"><div className="card-top"><span className="section-label"><Dumbbell size={15}/> REGISTRAR SERIE</span><span className="today-chip">SERIE {currentCount+1}</span></div>
                <h2>{currentEx?.name||'Elige un ejercicio'}</h2><p>{currentEx?.muscle} · {currentEx?.equipment} · Objetivo {currentRx?.targetSets} × {currentRx?.minReps}–{currentRx?.maxReps}</p>
                {previousSet&&<div className="previous-result"><TrendingUp size={17}/><span>Última vez: <strong>{showUnit(previousSet.weight)} × {previousSet.reps} reps</strong></span></div>}
                {progression&&<div className="progression-hint"><Sparkles size={17}/><span>{progression.kind==='increase'
                  ? `Completaste tus series objetivo. Si la técnica fue buena y la máquina lo permite, considera probar ${showUnit(progression.proposedWeightKg)}.`
                  : `Objetivo para hoy: consolida tus series hasta completar ${currentRx?.targetSets} × ${currentRx?.maxReps} con buena técnica.`}</span></div>}
                <div className="numbers-row"><div className="number-control"><span>PESO ({unit.toUpperCase()})</span><div><button aria-label="Disminuir peso" onClick={()=>setWeight(w=>Math.max(0,Number((w-(unit==='kg'?2.5:5)).toFixed(1))))}><Minus size={19}/></button><input type="number" min="0" step="0.5" inputMode="decimal" value={weight} onChange={e=>setWeight(Number(e.target.value))} aria-label={`Peso en ${unit}`}/><button aria-label="Aumentar peso" onClick={()=>setWeight(w=>Number((w+(unit==='kg'?2.5:5)).toFixed(1)))}><Plus size={19}/></button></div></div><div className="number-control"><span>REPETICIONES</span><div><button aria-label="Disminuir repeticiones" onClick={()=>setReps(r=>Math.max(1,r-1))}><Minus size={19}/></button><input type="number" min="1" max="100" step="1" inputMode="numeric" value={reps} onChange={e=>setReps(Number(e.target.value))} aria-label="Repeticiones"/><button aria-label="Aumentar repeticiones" onClick={()=>setReps(r=>Math.min(100,r+1))}><Plus size={19}/></button></div></div></div>
                <button className="save-set" onClick={saveSet}><Plus size={20}/> Guardar serie <Check size={19}/></button>
                <div className="logged-sets"><span className="section-label">SERIES DE ESTE EJERCICIO</span>{data.active.sets.filter(s=>s.exerciseId===selectedExercise).length===0?<p className="muted">Aún no has registrado ninguna serie.</p>:data.active.sets.filter(s=>s.exerciseId===selectedExercise).map((s,i)=><div className="logged-set" key={s.id}><span className="set-index">{i+1}</span><strong>{showUnit(s.weight)} <span>×</span> {s.reps}</strong><CheckCircle2 size={17} className="lime-text"/><button aria-label="Eliminar serie" onClick={()=>deleteSet(s.id)}><Trash2 size={15}/></button></div>)}</div>
                {restEnd&&<div className="rest-timer"><Timer size={19}/><span>Descanso</span><strong>{prettyDuration((restEnd-now)/1000)}</strong><button onClick={()=>setRestEnd(null)}>Omitir</button></div>}
                <button className="finish-btn" onClick={finishWorkout}><CheckCircle2 size={19}/> Finalizar entrenamiento</button>
              </section></div>
            </>}
          </>}
          {tab==='progress'&&<>
            <PageHead overline="DATOS QUE IMPORTAN" title="Tu progreso, en claro." sub="Tus estadísticas se calculan únicamente a partir de las sesiones registradas."/>
            <div className="progress-metrics"><Stat icon={Dumbbell} label="ENTRENAMIENTOS" value={String(totalSessions)} desc="Sesiones completadas"/><Stat icon={Activity} label="SERIES TOTALES" value={String(totalSets)} desc="Registradas"/><Stat icon={TrendingUp} label="VOLUMEN HISTÓRICO" value={D(totalVolume(data.workouts))} desc="kg·rep (peso × repeticiones)"/></div>
            <div className="progress-panels"><section className="card chart-card"><div className="card-top"><span className="section-label">VOLUMEN POR SEMANA</span><span className="today-chip">ÚLTIMAS 6</span></div><h2>Construyendo constancia</h2>{totalSessions===0?<Empty icon={BarChart3} title="Tus gráficas comienzan aquí" text="Cuando registres tu primer entrenamiento, RB podrá mostrar tu tendencia de volumen."/>:<VolumeChart data={trend}/>}</section>
              <section className="card muscle-card"><div className="card-top"><span className="section-label">SERIES POR MÚSCULO</span><span className="today-chip">ESTA SEMANA</span></div><h2>Tu distribución</h2>{(()=>{const counts=muscleSets(weekWorkouts(data.workouts));const entries=majorMuscles.filter(m=>counts[m]>0).sort((a,b)=>counts[b]-counts[a]);return entries.length?entries.map(m=><div className="muscle-row" key={m}><div><span>{m}</span><strong>{counts[m]} series</strong></div><div className="muscle-track"><span style={{width:`${pct(counts[m],Math.max(...Object.values(counts),1))}%`}}/></div></div>):<Empty icon={Target} title="Sin series esta semana" text="Aquí verás qué grupos musculares has trabajado."/>;})()}</section>
            </div>
            <section className="card history-card"><div className="section-heading"><div><span className="overline">TU CAMINO</span><h2>Historial de sesiones</h2></div><span className="session-count">{totalSessions} en total</span></div>{latest.length===0?<Empty icon={CalendarDays} title="Todavía no hay entrenamientos" text="Las sesiones que finalices aparecerán aquí, con sus series y marcas."/>:latest.slice(0,showAllSessions?undefined:8).map(w=><div key={w.id} className="history-item"><button className="history-main" onClick={()=>setExpandedHistory(expandedHistory===w.id?null:w.id)}><span className="history-icon"><Dumbbell size={19}/></span><span className="history-desc"><strong>{w.routineName}</strong><small>{dayLabel(w.endedAt)} · {w.sets.length} series · {durationMinutes(w)} min</small></span><span className="history-vol">{D(totalVolume([w]))}<small>kg·rep</small></span><ChevronDown size={17} className={expandedHistory===w.id?'rotated':''}/></button>{expandedHistory===w.id&&<div className="history-details">{w.sets.map(s=><div key={s.id}><span>{getExercise(s.exerciseId)?.name||s.exerciseId}</span><strong>{showUnit(s.weight)} × {s.reps}</strong></div>)}<button className="danger-link" onClick={()=>removeWorkout(w.id)}><Trash2 size={15}/> Eliminar sesión</button></div>}</div>)}{latest.length>8&&<button className="text-link show-more" onClick={()=>setShowAllSessions(v=>!v)}>{showAllSessions?'Mostrar menos':'Ver todas las sesiones'} <ChevronDown size={16}/></button>}</section>
            {totalSessions>0&&<section className="card pr-card"><div className="section-heading"><div><span className="overline">MARCAS PERSONALES</span><h2>Fuerza estimada</h2></div><Trophy size={22} className="lime-text"/></div><p className="muted">1RM aproximado según fórmula de Epley; no es una prueba de fuerza máxima.</p><div className="pr-grid">{catalog.map(ex=>({ex,best:bestEstimatedOneRepMax(data.workouts,ex.id)})).filter(x=>x.best!==null).sort((a,b)=>(b.best||0)-(a.best||0)).slice(0,6).map(({ex,best})=><div className="pr-tile" key={ex.id}><small>{ex.name}</small><strong>{showUnit(best||0)}</strong><span>1RM estimado</span></div>)}</div></section>}
          </>}
          {tab==='library'&&<>
            <PageHead overline="APRENDE CADA MOVIMIENTO" title="Conoce tus ejercicios." sub="Una guía inicial editable y centrada en equipos habituales de Planet Fitness. Confirma siempre el modelo y sus ajustes en el gimnasio."/>
            <div className="search-row"><label className="search-field"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Busca un ejercicio o máquina..."/></label></div>
            <div className="filter-scroll"><button className={muscleFilter==='Todos'?'chosen':''} onClick={()=>setMuscleFilter('Todos')}>Todos</button>{majorMuscles.map(m=><button key={m} className={muscleFilter===m?'chosen':''} onClick={()=>setMuscleFilter(m)}>{m}</button>)}</div>
            <div className="catalog-grid">{catalog.filter(e=>(muscleFilter==='Todos'||e.muscle===muscleFilter)&&`${e.name} ${e.equipment} ${e.muscle}`.toLowerCase().includes(search.toLowerCase())).map(ex=><button key={ex.id} className="exercise-tile" onClick={()=>setDetailId(ex.id)}><span className="exercise-icon"><Dumbbell size={25}/></span><span><small>{ex.muscle.toUpperCase()} • {ex.equipment.toUpperCase()}</small><strong>{ex.name}</strong><em>Ver cómo se usa <ArrowUpRight size={14}/></em></span></button>)}</div>
            {!catalog.some(e=>(muscleFilter==='Todos'||e.muscle===muscleFilter)&&`${e.name} ${e.equipment} ${e.muscle}`.toLowerCase().includes(search.toLowerCase()))&&<Empty icon={Search} title="Sin resultados" text="Intenta buscar otra máquina o grupo muscular."/>}
          </>}
          {tab==='profile'&&<>
            <PageHead overline="TU CONFIGURACIÓN" title="Tu perfil RB." sub="Personaliza tu experiencia y conserva el control sobre tus registros."/>
            <div className="profile-grid"><section className="card profile-card"><div className="card-top"><span className="section-label"><UserRound size={16}/> DATOS PERSONALES</span><span className="today-chip">EDITABLE</span></div>
              <label className="form-label">Nombre<input maxLength={40} value={data.profile.name} onChange={e=>setData(d=>({...d,profile:{...d.profile,name:e.target.value}}))}/></label>
              <label className="form-label">Gimnasio<input maxLength={80} value={data.profile.gym} onChange={e=>setData(d=>({...d,profile:{...d.profile,gym:e.target.value}}))}/></label>
              <label className="form-label">Objetivo<select value={data.profile.goal} onChange={e=>setData(d=>({...d,profile:{...d.profile,goal:e.target.value as AppData['profile']['goal']}}))}><option value="muscle">Ganar masa muscular</option><option value="strength">Ganar fuerza</option><option value="loss">Perder grasa</option><option value="maintenance">Mantenerme activo</option></select></label>
              <label className="form-label">Días por semana<select value={data.profile.daysPerWeek} onChange={e=>setData(d=>({...d,profile:{...d.profile,daysPerWeek:Number(e.target.value)}}))}>{[1,2,3,4,5,6,7].map(n=><option key={n} value={n}>{n} {n===1?'día':'días'}</option>)}</select></label>
              <label className="form-label">Peso corporal (kg, opcional)<input type="number" min="0" max="500" step="0.1" inputMode="decimal" placeholder="Sin registrar" value={data.profile.bodyweightKg??''} onChange={e=>setData(d=>({...d,profile:{...d.profile,bodyweightKg:e.target.value===''?null:Math.max(0,Math.min(500,Number(e.target.value)||0))}}))}/></label>
              <label className="form-label">Unidad de los pesos<select value={data.profile.weightUnit} onChange={e=>setData(d=>({...d,profile:{...d.profile,weightUnit:e.target.value as 'kg'|'lb'}}))}><option value="kg">Kilogramos (kg)</option><option value="lb">Libras (lb)</option></select></label>
            </section><section className="profile-column"><section className="card settings-card"><div className="card-top"><span className="section-label"><Sun size={16}/> APARIENCIA</span></div><h3>Elige tu ambiente</h3><div className="theme-switch"><button className={data.theme==='dark'?'theme-selected':''} onClick={()=>setData(d=>({...d,theme:'dark'}))}><Moon size={18}/> Oscuro</button><button className={data.theme==='light'?'theme-selected':''} onClick={()=>setData(d=>({...d,theme:'light'}))}><Sun size={18}/> Claro</button></div></section>
              <section className="card settings-card"><div className="card-top"><span className="section-label"><ShieldCheck size={16}/> TUS DATOS</span></div><h3>Respaldo y privacidad</h3><p>Tus sesiones están guardadas en este navegador. Exporta un archivo para evitar perderlas si cambias de teléfono o borras los datos.</p><div className="settings-buttons"><button className="secondary-btn" onClick={()=>downloadBackup(data)}><Download size={17}/> Exportar JSON</button><button className="secondary-btn" onClick={()=>fileInput.current?.click()}><Upload size={17}/> Importar JSON</button><input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={e=>{const f=e.target.files?.[0];if(f)void importBackup(f);}}/></div></section>
              <section className="card settings-card"><div className="card-top"><span className="section-label"><RotateCcw size={16}/> CICLO DE RUTINAS</span></div><h3>Cambiar día del ciclo</h3><p>Elige el siguiente día cuando quieras. No se marcan faltas por días de calendario.</p><select className="cycle-selector" value={data.cycleIndex} onChange={e=>skipTo(Number(e.target.value))}>{routines.map((r,i)=><option key={r.id} value={i}>Día {i+1} · {r.name}</option>)}</select></section>
              <section className="card settings-card danger-card"><h3>Reiniciar datos</h3><p>Elimina permanentemente los entrenamientos y vuelve a las rutinas predeterminadas.</p><button className="danger-link" onClick={resetAll}><Trash2 size={16}/> Borrar mis datos</button></section>
              </section></div>
          </>}
        </>}
      </main>
      <footer className="app-footer"><span>RB FITNESS © 2026</span><span>PROGRESO REAL, SIN ATAJOS.</span></footer>
    </div>
    <nav className="bottom-nav">{nav.map(({id,label,icon:Icon})=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={21} strokeWidth={tab===id?2.6:2}/><span>{label}</span></button>)}<button className={tab==='profile'?'active':''} onClick={()=>setTab('profile')}><UserRound size={21}/><span>Perfil</span></button></nav>
    {notice&&<div role="status" className="toast"><CheckCircle2 size={19}/>{notice}<button onClick={()=>setNotice(null)} aria-label="Cerrar aviso"><X size={15}/></button></div>}
    {detailId&&(()=>{const e=getExercise(detailId);return e?<div className="modal-backdrop" onClick={()=>setDetailId(null)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={event=>event.stopPropagation()}><button className="modal-close" onClick={()=>setDetailId(null)} aria-label="Cerrar"><X size={21}/></button><span className="overline">GUÍA DE EQUIPAMIENTO</span><div className="modal-illustration"><Dumbbell size={56}/></div><h2 id="detail-title">{e.name}</h2><div className="modal-chips"><span>{e.muscle}</span><span>{e.equipment}</span></div><h3>Cómo realizarlo</h3><p>{e.instruction}</p><div className="safe-tip"><Info size={19}/><span>{e.tip} Si tienes dudas con una máquina, pide ayuda al personal del gimnasio.</span></div><button className="lime-btn modal-ok" onClick={()=>setDetailId(null)}>Entendido <Check size={17}/></button></div></div>:null;})()}
    {editingRoutine&&(()=>{const routine=routines.find(r=>r.id===editingRoutine);return routine?<div className="modal-backdrop" onClick={()=>setEditingRoutine(null)}><div className="modal edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title" onClick={e=>e.stopPropagation()}><button className="modal-close" aria-label="Cerrar" onClick={()=>setEditingRoutine(null)}><X size={21}/></button><span className="overline">PERSONALIZAR RUTINA</span><h2 id="edit-title">{routine.name}</h2><label className="form-label">Nombre de rutina<input maxLength={65} value={routine.name} onChange={e=>editRoutine(routine.id,r=>({...r,name:e.target.value}))}/></label><div className="edit-exercises"><span className="section-label">EJERCICIOS DE LA RUTINA</span>{routine.exercises.map((rx,i)=><div className="edit-row" key={`${rx.exerciseId}-${i}`}><strong>{getExercise(rx.exerciseId)?.name}</strong><div><label>Series<input aria-label="Series objetivo" type="number" min="1" max="10" value={rx.targetSets} onChange={e=>editRoutine(routine.id,r=>({...r,exercises:r.exercises.map((item,j)=>i===j?{...item,targetSets:Math.max(1,Math.min(10,Number(e.target.value)||1))}:item)}))}/></label><button aria-label="Quitar ejercicio" onClick={()=>editRoutine(routine.id,r=>({...r,exercises:r.exercises.filter((_,j)=>i!==j)}))}><Trash2 size={18}/></button></div></div>)}</div><label className="form-label">Añadir ejercicio<select value="" onChange={e=>{if(e.target.value)editRoutine(routine.id,r=>({...r,exercises:[...r.exercises,makeRx(e.target.value)]}));}}><option value="">Seleccionar del catálogo...</option>{catalog.filter(ex=>!routine.exercises.some(rx=>rx.exerciseId===ex.id)).map(ex=><option value={ex.id} key={ex.id}>{ex.name}</option>)}</select></label><button className="lime-btn modal-ok" onClick={()=>setEditingRoutine(null)}>Listo <Check size={17}/></button></div></div>:null;})()}
  </div>;
}
function PageHead({overline,title,sub}:{overline:string;title:string;sub:string}) {return <div className="page-head"><span className="overline">{overline}</span><h1>{title}</h1><p>{sub}</p></div>;}
function Empty({icon:Icon,title,text}:{icon:typeof Dumbbell;title:string;text:string}) {return <div className="empty"><span><Icon size={26}/></span><strong>{title}</strong><p>{text}</p></div>;}
function Stat({icon:Icon,label,value,desc}:{icon:typeof Dumbbell;label:string;value:string;desc:string}) {return <div className="card stat-tile"><span><Icon size={21}/></span><small>{label}</small><strong>{value}</strong><em>{desc}</em></div>;}
