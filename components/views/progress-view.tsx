'use client';
import { useState } from 'react';
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Dumbbell,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Empty, PageHead, Stat } from '@/components/ui/bits';
import VolumeChart from '@/components/volume-chart';
import { catalog, getExercise, majorMuscles } from '@/lib/catalog';
import { D, pct } from '@/lib/format';
import {
  bestEstimatedOneRepMax,
  dayLabel,
  durationMinutes,
  muscleSets,
  totalVolume,
  weekWorkouts,
  type volumeByWeek,
} from '@/lib/metrics';
import type { AppData, Workout } from '@/lib/types';

const RECENT_LIMIT = 8;

export default function ProgressView({
  data,
  trend,
  latest,
  totalSessions,
  totalSets,
  showUnit,
  onRemoveWorkout,
}: {
  data: AppData;
  trend: ReturnType<typeof volumeByWeek>;
  latest: Workout[];
  totalSessions: number;
  totalSets: number;
  showUnit: (kg: number) => string;
  onRemoveWorkout: (workoutId: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const weekCounts = muscleSets(weekWorkouts(data.workouts));
  const muscles = majorMuscles.filter((m) => weekCounts[m] > 0).sort((a, b) => weekCounts[b] - weekCounts[a]);
  const maxCount = Math.max(...Object.values(weekCounts), 1);
  const records = catalog
    .map((exercise) => ({ exercise, best: bestEstimatedOneRepMax(data.workouts, exercise.id) }))
    .filter((entry) => entry.best !== null)
    .sort((a, b) => (b.best || 0) - (a.best || 0))
    .slice(0, 6);

  return (
    <>
      <PageHead
        overline="DATOS QUE IMPORTAN"
        title="Tu progreso, en claro."
        sub="Tus estadísticas se calculan únicamente a partir de las sesiones registradas."
      />
      <div className="progress-metrics">
        <Stat
          icon={Dumbbell}
          label="ENTRENAMIENTOS"
          value={String(totalSessions)}
          desc="Sesiones completadas"
        />
        <Stat icon={Activity} label="SERIES TOTALES" value={String(totalSets)} desc="Registradas" />
        <Stat
          icon={TrendingUp}
          label="VOLUMEN HISTÓRICO"
          value={D(totalVolume(data.workouts))}
          desc="kg·rep (peso × repeticiones)"
        />
      </div>

      <div className="progress-panels">
        <section className="card chart-card">
          <div className="card-top">
            <span className="section-label">VOLUMEN POR SEMANA</span>
            <span className="today-chip">ÚLTIMAS 6</span>
          </div>
          <h2>Construyendo constancia</h2>
          {totalSessions === 0 ? (
            <Empty
              icon={BarChart3}
              title="Tus gráficas comienzan aquí"
              text="Cuando registres tu primer entrenamiento, RB podrá mostrar tu tendencia de volumen."
            />
          ) : (
            <VolumeChart data={trend} />
          )}
        </section>
        <section className="card muscle-card">
          <div className="card-top">
            <span className="section-label">SERIES POR MÚSCULO</span>
            <span className="today-chip">ESTA SEMANA</span>
          </div>
          <h2>Tu distribución</h2>
          {muscles.length ? (
            muscles.map((muscle) => (
              <div className="muscle-row" key={muscle}>
                <div>
                  <span>{muscle}</span>
                  <strong>{weekCounts[muscle]} series</strong>
                </div>
                <div className="muscle-track">
                  <span style={{ width: `${pct(weekCounts[muscle], maxCount)}%` }} />
                </div>
              </div>
            ))
          ) : (
            <Empty
              icon={Target}
              title="Sin series esta semana"
              text="Aquí verás qué grupos musculares has trabajado."
            />
          )}
        </section>
      </div>

      <section className="card history-card">
        <div className="section-heading">
          <div>
            <span className="overline">TU CAMINO</span>
            <h2>Historial de sesiones</h2>
          </div>
          <span className="session-count">{totalSessions} en total</span>
        </div>
        {latest.length === 0 ? (
          <Empty
            icon={CalendarDays}
            title="Todavía no hay entrenamientos"
            text="Las sesiones que finalices aparecerán aquí, con sus series y marcas."
          />
        ) : (
          latest.slice(0, showAll ? undefined : RECENT_LIMIT).map((workout) => (
            <div key={workout.id} className="history-item">
              <button
                className="history-main"
                onClick={() => setExpanded(expanded === workout.id ? null : workout.id)}
                aria-expanded={expanded === workout.id}
              >
                <span className="history-icon">
                  <Dumbbell size={19} />
                </span>
                <span className="history-desc">
                  <strong>{workout.routineName}</strong>
                  <small>
                    {dayLabel(workout.endedAt)} · {workout.sets.length} series · {durationMinutes(workout)}{' '}
                    min
                  </small>
                </span>
                <span className="history-vol">
                  {D(totalVolume([workout]))}
                  <small>kg·rep</small>
                </span>
                <ChevronDown size={17} className={expanded === workout.id ? 'rotated' : ''} />
              </button>
              {expanded === workout.id && (
                <div className="history-details">
                  {workout.sets.map((set) => (
                    <div key={set.id}>
                      <span>{getExercise(set.exerciseId)?.name || set.exerciseId}</span>
                      <strong>
                        {showUnit(set.weight)} × {set.reps}
                      </strong>
                    </div>
                  ))}
                  <button className="danger-link" onClick={() => onRemoveWorkout(workout.id)}>
                    <Trash2 size={15} /> Eliminar sesión
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {latest.length > RECENT_LIMIT && (
          <button className="text-link show-more" onClick={() => setShowAll((value) => !value)}>
            {showAll ? 'Mostrar menos' : 'Ver todas las sesiones'} <ChevronDown size={16} />
          </button>
        )}
      </section>

      {totalSessions > 0 && (
        <section className="card pr-card">
          <div className="section-heading">
            <div>
              <span className="overline">MARCAS PERSONALES</span>
              <h2>Fuerza estimada</h2>
            </div>
            <Trophy size={22} className="lime-text" />
          </div>
          <p className="muted">1RM aproximado según fórmula de Epley; no es una prueba de fuerza máxima.</p>
          <div className="pr-grid">
            {records.map(({ exercise, best }) => (
              <div className="pr-tile" key={exercise.id}>
                <small>{exercise.name}</small>
                <strong>{showUnit(best || 0)}</strong>
                <span>1RM estimado</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
