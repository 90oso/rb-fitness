'use client';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProgressRing from '@/components/progress-ring';
import { RaiseLine } from '@/components/ui/bits';
import { getExercise } from '@/lib/catalog';
import { D, greeting, shortDate } from '@/lib/format';
import type { volumeByWeek, weekMetrics } from '@/lib/metrics';
import { raiseCount } from '@/lib/session';
import type { AppData, Routine } from '@/lib/types';

const dayNumber = (index: number) => String(index + 1).padStart(2, '0');

/** Línea de tendencia del volumen de las últimas semanas, normalizada a un recuadro de 120×28. */
function sparkPoints(values: number[]) {
  if (values.length < 2) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min;
  return values
    .map((value, i) => {
      const x = (i * 120) / (values.length - 1);
      const y = span === 0 ? 24 : 24 - ((value - min) / span) * 20;
      return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
    })
    .join(' ');
}

export default function TodayView({
  data,
  metrics,
  trend,
  nextRoutine,
  totalSessions,
  now,
  onContinue,
  onStart,
  onMarkRest,
  onSkipTo,
  onGoTrain,
}: {
  data: AppData;
  metrics: ReturnType<typeof weekMetrics>;
  trend: ReturnType<typeof volumeByWeek>;
  nextRoutine: Routine;
  totalSessions: number;
  now: number;
  onContinue: () => void;
  onStart: (routineId: string) => void;
  onMarkRest: () => void;
  onSkipTo: (index: number) => void;
  onGoTrain: () => void;
}) {
  const today = new Date(now);
  const shortName = data.profile.name.trim().split(/\s+/)[0] || 'Atleta';
  const nextIndex = Math.max(
    0,
    data.routines.findIndex((routine) => routine.id === nextRoutine.id)
  );
  const primaryAction = () =>
    data.active ? onContinue() : nextRoutine.isRest ? onMarkRest() : onStart(nextRoutine.id);
  const ctaLabel = data.active
    ? 'Continuar entrenamiento'
    : nextRoutine.isRest
      ? 'Marcar descanso'
      : 'Empezar entrenamiento';

  const names = nextRoutine.exercises
    .map((rx) => getExercise(rx.exerciseId)?.name)
    .filter((name): name is string => Boolean(name));
  const preview =
    names.length === 0
      ? ''
      : names.length > 2
        ? `${names.slice(0, 2).join(' · ')} · +${names.length - 2} más`
        : names.join(' · ');
  const spark = sparkPoints(trend.map((week) => week.volumen));

  return (
    <div className="hoy">
      <span className="hoy-mark" aria-hidden="true">
        {dayNumber(nextIndex)}
      </span>

      <header className="hoy-greet">
        <h1>
          {greeting(today)}, {shortName}
        </h1>
        <time dateTime={today.toISOString()}>{shortDate(today)}</time>
      </header>

      <section className="hoy-hero" aria-label="Tu próxima sesión">
        <div className="hoy-hero-top">
          <span className="hoy-label">
            {nextRoutine.isRest ? 'Día de recuperación' : 'Tu próxima sesión'}
          </span>
          <span className="hoy-tag">
            Día {nextIndex + 1} de {data.routines.length}
          </span>
        </div>
        <h2>{nextRoutine.name}</h2>
        <p className="hoy-meta">
          {nextRoutine.isRest
            ? 'Recupera energía para el próximo entrenamiento'
            : `${nextRoutine.exercises.length} ejercicios · ${data.profile.gym}`}
        </p>
        <RaiseLine count={raiseCount(data.workouts, nextRoutine.exercises)} className="hoy-meta" />
        {preview && <p className="hoy-preview">{preview}</p>}
        <button className="lime-btn hoy-cta" onClick={primaryAction}>
          {ctaLabel}
          <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </section>

      <section className="hoy-week" aria-labelledby="hoy-week-title">
        <div className="hoy-row">
          <h2 id="hoy-week-title">Esta semana</h2>
          <span>
            {metrics.sessions} de {metrics.sessionsGoal} sesiones
          </span>
        </div>
        <div className="hoy-tiles">
          <div className="hoy-tile hoy-tile-ring">
            <ProgressRing current={metrics.sessions} goal={metrics.sessionsGoal} label="Progreso semanal" />
            <div>
              <strong>
                {metrics.sessions}/{metrics.sessionsGoal}
              </strong>
              <small>Sesiones</small>
            </div>
          </div>
          <div className="hoy-tile hoy-tile-vol">
            <div className="hoy-vol">
              <strong>{D(metrics.volume)}</strong>
              <small>kg·rep</small>
            </div>
            {spark ? (
              <svg
                className="hoy-spark"
                role="img"
                aria-label="Volumen de las últimas semanas"
                viewBox="0 0 120 28"
                preserveAspectRatio="none"
              >
                <polyline points={spark} />
              </svg>
            ) : null}
          </div>
        </div>
      </section>

      <section className="hoy-cycle" aria-labelledby="hoy-cycle-title">
        <div className="hoy-cycle-head">
          <h2 id="hoy-cycle-title">Tu ciclo</h2>
          <button className="text-link" onClick={onGoTrain}>
            Ver rutinas <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="cycle-scroller">
          {data.routines.map((routine, index) => {
            const isNext = nextRoutine.id === routine.id;
            return (
              <button
                key={routine.id}
                className={`cycle-card ${isNext ? 'cycle-current' : ''} ${routine.isRest ? 'cycle-rest' : ''}`}
                onClick={() => onSkipTo(index)}
              >
                <span className="cycle-top">
                  <span className="cycle-num">
                    <span className="sr-only">Día </span>
                    {dayNumber(index)}
                  </span>
                  {isNext && <span className="cycle-badge">Siguiente</span>}
                </span>
                <span className="cycle-body">
                  <strong>{routine.name}</strong>
                  <small>{routine.isRest ? 'Descanso' : `${routine.exercises.length} ejercicios`}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {totalSessions === 0 && (
        <div className="first-tip hoy-tip">
          <Sparkles size={19} aria-hidden="true" />
          <div>
            <strong>Todo gran progreso empieza en cero.</strong>
            <span>Inicia tu primera sesión y verás tus estadísticas completarse automáticamente.</span>
          </div>
        </div>
      )}
    </div>
  );
}
