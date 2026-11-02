'use client';
import { useEffect, useMemo, useState } from 'react';
import { CloudOff } from 'lucide-react';
import AuthScreen from './auth-screen';
import { AuthLoading } from './ui/auth-frame';
import ExerciseDetailModal from './modals/exercise-detail-modal';
import RoutineEditorModal from './modals/routine-editor-modal';
import { BottomNav, Sidebar, Topbar, type Tab } from './shell/app-shell';
import ActiveSessionView from './views/active-session-view';
import LibraryView from './views/library-view';
import ProfileView from './views/profile-view';
import ProgressView from './views/progress-view';
import TodayView from './views/today-view';
import TrainView from './views/train-view';
import { useAuth } from '@/hooks/use-auth';
import { useCloudSync } from '@/hooks/use-cloud-sync';
import { useConfirm } from '@/hooks/use-confirm';
import { useToast } from '@/hooks/use-toast';
import { getExercise, initialData } from '@/lib/catalog';
import { addCycleDay, defaultCycleDay, duplicateCycleDay, moveCycleDay, removeCycleDay } from '@/lib/cycles';
import { D, makeRx } from '@/lib/format';
import {
  allSets,
  progressionAdvice,
  recentSetForExercise,
  suggestions,
  uid,
  volumeByWeek,
  weekMetrics,
} from '@/lib/metrics';
import { downloadBackup } from '@/lib/storage';
import type { AppData, Profile, Routine, Workout } from '@/lib/types';

const KG_PER_LB = 1 / 2.2046226218;

export default function RBApp() {
  const auth = useAuth();
  const sync = useCloudSync(auth.client, auth.userId);
  const { confirm, dialog } = useConfirm();
  const { toast, toastNode } = useToast();
  const { data, setData, getData, hydrated } = sync;

  const [tab, setTab] = useState<Tab>('today');
  const [now, setNow] = useState(() => Date.now());
  const [restEnd, setRestEnd] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<string | null>(null);
  const [showCycleManager, setShowCycleManager] = useState(false);
  const [cycleError, setCycleError] = useState('');

  // One clock: every second while a session or a rest timer runs, once a minute otherwise (date and greeting).
  const restRemainingMs = restEnd !== null && restEnd > now ? restEnd - now : null;
  const ticking = data.active !== null || restRemainingMs !== null;
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), ticking ? 1000 : 60000);
    return () => window.clearInterval(timer);
  }, [ticking]);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const unit = data.profile.weightUnit;
  const fromKg = (kg: number) => (unit === 'kg' ? kg : kg / KG_PER_LB);
  const toKg = (value: number) => (unit === 'kg' ? value : value * KG_PER_LB);
  const showUnit = (kg: number) => `${D(fromKg(kg))} ${unit}`;

  const routines = data.routines;
  const nextRoutine = routines[data.cycleIndex % routines.length] || routines[0];
  const activeRoutine = routines.find((r) => r.id === data.active?.routineId);
  const metrics = useMemo(() => weekMetrics(data), [data]);
  const trend = useMemo(() => volumeByWeek(data.workouts), [data.workouts]);
  const suggestionList = useMemo(() => suggestions(data), [data]);
  const latest = useMemo(
    () => [...data.workouts].sort((a, b) => b.endedAt.localeCompare(a.endedAt)),
    [data.workouts]
  );
  const totalSessions = data.workouts.length;
  const totalSets = allSets(data.workouts).length;
  const currentRx = activeRoutine?.exercises.find((rx) => rx.exerciseId === selectedExercise);
  const currentExercise = getExercise(selectedExercise);
  const previousSet = recentSetForExercise(data.workouts, selectedExercise);
  const progression = currentRx
    ? progressionAdvice(data.workouts, selectedExercise, currentRx.targetSets, currentRx.maxReps)
    : null;

  function changeCycle(action: (current: AppData) => AppData) {
    try {
      setCycleError('');
      const next = action(getData());
      setData(next);
    } catch (err) {
      setCycleError(err instanceof Error ? err.message : 'No se pudo cambiar el ciclo.');
    }
  }
  function addNewDay(isRest: boolean) {
    const id = uid();
    changeCycle((current) => addCycleDay(current, defaultCycleDay(id, isRest)));
    if (!isRest) setEditingRoutine(id);
  }
  async function removeDay(routineId: string) {
    const ok = await confirm({
      title: '¿Eliminar este día del ciclo?',
      message: 'El historial de sesiones completadas no se borrará.',
      confirmLabel: 'Eliminar día',
      danger: true,
    });
    if (ok) changeCycle((current) => removeCycleDay(current, routineId));
  }
  function editRoutine(routineId: string, update: (routine: Routine) => Routine) {
    setData((current) => ({
      ...current,
      routines: current.routines.map((r) => (r.id === routineId ? update(r) : r)),
    }));
  }
  function updateProfile(patch: Partial<Profile>) {
    setData((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
  }

  function startWorkout(routineId: string) {
    if (!hydrated || sync.status === 'error') {
      toast('Confirma la conexión antes de entrenar.');
      return;
    }
    if (data.active) {
      setTab('train');
      toast('Ya tienes una sesión en curso.');
      return;
    }
    const routine = routines.find((r) => r.id === routineId);
    if (!routine || routine.isRest || routine.exercises.length === 0) {
      toast('Añade ejercicios antes de iniciar este día.');
      return;
    }
    const first = routine.exercises[0]?.exerciseId || '';
    setSelectedExercise(first);
    const last = recentSetForExercise(data.workouts, first);
    setWeight(last ? Number(fromKg(last.weight).toFixed(1)) : 0);
    setReps(last?.reps || 10);
    setData((current) => ({
      ...current,
      active: { id: uid(), routineId, startedAt: new Date().toISOString(), sets: [] },
    }));
    setTab('train');
    setRestEnd(null);
  }
  function selectExercise(exerciseId: string) {
    setSelectedExercise(exerciseId);
    const previous = recentSetForExercise(data.workouts, exerciseId);
    const inCurrent = data.active?.sets.filter((set) => set.exerciseId === exerciseId).at(-1);
    const source = inCurrent ?? previous;
    setWeight(source ? Number(fromKg(source.weight).toFixed(1)) : 0);
    setReps(inCurrent?.reps || previous?.reps || 10);
  }
  function saveSet() {
    if (
      !data.active ||
      !currentExercise ||
      !Number.isFinite(weight) ||
      weight < 0 ||
      toKg(weight) > 3000 ||
      !Number.isInteger(reps) ||
      reps < 1 ||
      reps > 100
    ) {
      toast('Revisa el peso y las repeticiones.');
      return;
    }
    const entry = {
      id: uid(),
      exerciseId: selectedExercise,
      reps,
      weight: toKg(weight),
      performedAt: new Date().toISOString(),
    };
    setData((current) => ({
      ...current,
      active: current.active ? { ...current.active, sets: [...current.active.sets, entry] } : null,
    }));
    setRestEnd(Date.now() + (currentRx?.restSeconds || 90) * 1000);
    toast('Serie registrada. Buen trabajo.');
  }
  function deleteSet(setId: string) {
    setData((current) => ({
      ...current,
      active: current.active
        ? { ...current.active, sets: current.active.sets.filter((s) => s.id !== setId) }
        : null,
    }));
    toast('Serie eliminada.');
  }
  function finishWorkout() {
    if (!data.active) return;
    if (!data.active.sets.length) {
      toast('Registra al menos una serie para completar.');
      return;
    }
    const routine = routines.find((r) => r.id === data.active?.routineId);
    const finished: Workout = {
      id: data.active.id,
      routineId: data.active.routineId,
      routineName: routine?.name || 'Entrenamiento',
      startedAt: data.active.startedAt,
      endedAt: new Date().toISOString(),
      sets: data.active.sets,
    };
    setData((current) => ({
      ...current,
      workouts: [...current.workouts, finished],
      active: null,
      cycleIndex:
        (Math.max(
          0,
          current.routines.findIndex((r) => r.id === finished.routineId)
        ) +
          1) %
        Math.max(1, current.routines.length),
    }));
    setRestEnd(null);
    setTab('progress');
    toast('¡Sesión guardada en tu historial!');
  }
  async function discardWorkout() {
    const ok = await confirm({
      title: '¿Descartar esta sesión?',
      message: 'Las series registradas no se guardarán.',
      confirmLabel: 'Descartar',
      danger: true,
    });
    if (!ok) return;
    setData((current) => ({ ...current, active: null }));
    setRestEnd(null);
    setTab('today');
  }
  function markRest() {
    setData((current) => ({
      ...current,
      cycleIndex: (current.cycleIndex + 1) % Math.max(1, current.routines.length),
      lastRestDate: new Date().toISOString(),
    }));
    toast('Descanso registrado. Tu ciclo continúa.');
  }
  function skipTo(index: number) {
    if (data.active) {
      toast('Finaliza tu sesión activa antes de cambiar el ciclo.');
      return;
    }
    setData((current) => ({ ...current, cycleIndex: index }));
    setTab('today');
  }
  function applyFlexible(exerciseIds: string[]) {
    const targetId = nextRoutine.id;
    setData((current) => ({
      ...current,
      routines: current.routines.map((r) =>
        r.id === targetId ? { ...r, exercises: exerciseIds.map(makeRx) } : r
      ),
    }));
    toast('Propuesta aplicada a tu día flexible. Puedes editarla.');
  }
  async function removeWorkout(workoutId: string) {
    const ok = await confirm({
      title: '¿Eliminar esta sesión del historial?',
      message: 'No se puede deshacer.',
      confirmLabel: 'Eliminar sesión',
      danger: true,
    });
    if (!ok) return;
    setData((current) => ({ ...current, workouts: current.workouts.filter((w) => w.id !== workoutId) }));
    toast('Sesión eliminada.');
  }
  async function resetAll() {
    const first = await confirm({
      title: 'Borrar mis datos',
      message:
        'Esto reemplazará TODO el historial y las rutinas de tu cuenta en la nube por los datos iniciales.',
      confirmLabel: 'Continuar',
      danger: true,
    });
    if (!first) return;
    const second = await confirm({
      title: 'Última confirmación',
      message: '¿Reiniciar RB? No hay forma de deshacerlo salvo un respaldo JSON.',
      confirmLabel: 'Sí, reiniciar',
      danger: true,
    });
    if (!second) return;
    setData(structuredClone(initialData));
    setTab('today');
    toast('Reinicio preparado. Espera confirmación de guardado.');
  }
  async function signOut() {
    if (sync.isBusy()) {
      toast('Hay cambios sin confirmar. Vuelve a intentar cuando se guarden.');
      return;
    }
    await auth.signOut();
    setTab('today');
    setRestEnd(null);
  }

  // ---- Screens before the app --------------------------------------------------------------
  if (auth.configured === null || (auth.configured && auth.session === 'checking')) {
    return <AuthLoading title="Iniciando RB" />;
  }
  if (!auth.configured || auth.session === 'signed-out' || auth.recovery) {
    return (
      <AuthScreen
        client={auth.client}
        configured={auth.configured}
        recovery={auth.recovery}
        onRecoveryDone={auth.finishRecovery}
      />
    );
  }
  if (!hydrated) {
    const failed = sync.status === 'error';
    return (
      <AuthLoading
        title={failed ? 'No pudimos cargar tus datos' : 'Cargando tu cuenta'}
        detail={failed ? sync.error : undefined}
        pulse={!failed}
      >
        {failed && (
          <div className="settings-buttons">
            <button className="secondary-btn" onClick={() => window.location.reload()}>
              Reintentar
            </button>
            <button className="secondary-btn" onClick={() => void auth.signOut()}>
              Cerrar sesión
            </button>
          </div>
        )}
      </AuthLoading>
    );
  }

  // ---- App -----------------------------------------------------------------------------------
  return (
    <div className="app-root">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Sidebar tab={tab} onSelect={setTab} />
      <div className="content-shell">
        <Topbar
          tab={tab}
          syncStatus={sync.status}
          syncError={sync.error}
          inSession={data.active !== null}
          onSelect={setTab}
        />
        <main className="main-content">
          {sync.status === 'error' && (
            <div className="sync-warning" role="alert">
              <CloudOff size={19} />
              <div>
                <strong>Los cambios no están guardados en la nube.</strong>
                <p>{sync.error}</p>
              </div>
              <button className="secondary-btn" onClick={() => void sync.retry()}>
                Reintentar guardado
              </button>
            </div>
          )}

          {tab === 'today' && (
            <TodayView
              data={data}
              metrics={metrics}
              nextRoutine={nextRoutine}
              totalSessions={totalSessions}
              totalSets={totalSets}
              now={now}
              onContinue={() => setTab('train')}
              onStart={startWorkout}
              onMarkRest={markRest}
              onSkipTo={skipTo}
              onGoTrain={() => setTab('train')}
            />
          )}

          {tab === 'train' &&
            (data.active ? (
              <ActiveSessionView
                active={data.active}
                routine={activeRoutine}
                now={now}
                selectedExercise={selectedExercise}
                currentExercise={currentExercise}
                currentRx={currentRx}
                previousSet={previousSet}
                progression={progression}
                weight={weight}
                reps={reps}
                unit={unit}
                restRemainingMs={restRemainingMs}
                showUnit={showUnit}
                onSelectExercise={selectExercise}
                onWeightChange={setWeight}
                onRepsChange={setReps}
                onSaveSet={saveSet}
                onDeleteSet={deleteSet}
                onSkipRest={() => setRestEnd(null)}
                onFinish={finishWorkout}
                onDiscard={() => void discardWorkout()}
              />
            ) : (
              <TrainView
                data={data}
                nextRoutine={nextRoutine}
                suggestionList={suggestionList}
                showCycleManager={showCycleManager}
                cycleError={cycleError}
                onToggleCycleManager={() => setShowCycleManager((v) => !v)}
                onAddDay={addNewDay}
                onMoveDay={(id, direction) => changeCycle((current) => moveCycleDay(current, id, direction))}
                onDuplicateDay={(id) => changeCycle((current) => duplicateCycleDay(current, id, uid()))}
                onRemoveDay={(id) => void removeDay(id)}
                onEditRoutine={setEditingRoutine}
                onStart={startWorkout}
                onMarkRest={markRest}
                onApplyFlexible={applyFlexible}
              />
            ))}

          {tab === 'progress' && (
            <ProgressView
              data={data}
              trend={trend}
              latest={latest}
              totalSessions={totalSessions}
              totalSets={totalSets}
              showUnit={showUnit}
              onRemoveWorkout={(id) => void removeWorkout(id)}
            />
          )}

          {tab === 'library' && <LibraryView onOpenExercise={setDetailId} />}

          {tab === 'profile' && (
            <ProfileView
              data={data}
              email={auth.email}
              syncStatus={sync.status}
              onProfileChange={updateProfile}
              onSkipTo={skipTo}
              onExport={() => downloadBackup(data)}
              onSignOut={() => void signOut()}
              onReset={() => void resetAll()}
            />
          )}
        </main>
        <footer className="app-footer">
          <span>RB FITNESS © 2026</span>
          <span>PROGRESO REAL, SIN ATAJOS.</span>
        </footer>
      </div>
      <BottomNav tab={tab} onSelect={setTab} />

      {toastNode}
      {detailId && <ExerciseDetailModal exerciseId={detailId} onClose={() => setDetailId(null)} />}
      {editingRoutine &&
        (() => {
          const routine = routines.find((r) => r.id === editingRoutine);
          return routine ? (
            <RoutineEditorModal
              routine={routine}
              onSave={(saved) => editRoutine(routine.id, () => saved)}
              onClose={() => setEditingRoutine(null)}
            />
          ) : null;
        })()}
      {dialog}
    </div>
  );
}
