'use client';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Dumbbell,
  Sparkles,
  Target,
  Trophy,
  Waves,
} from 'lucide-react';
import Rings from '@/components/rings';
import { D, greeting, longDate, pct } from '@/lib/format';
import type { weekMetrics } from '@/lib/metrics';
import type { AppData, Routine } from '@/lib/types';

export default function TodayView({
  data,
  metrics,
  nextRoutine,
  totalSessions,
  totalSets,
  now,
  onContinue,
  onStart,
  onMarkRest,
  onSkipTo,
  onGoTrain,
}: {
  data: AppData;
  metrics: ReturnType<typeof weekMetrics>;
  nextRoutine: Routine;
  totalSessions: number;
  totalSets: number;
  now: number;
  onContinue: () => void;
  onStart: (routineId: string) => void;
  onMarkRest: () => void;
  onSkipTo: (index: number) => void;
  onGoTrain: () => void;
}) {
  const today = new Date(now);
  const shortName = data.profile.name.trim().split(/\s+/)[0] || 'Atleta';
  const primaryAction = () =>
    data.active ? onContinue() : nextRoutine.isRest ? onMarkRest() : onStart(nextRoutine.id);

  return (
    <>
      <div className="eyebrow-line">
        <span>{longDate(today).toUpperCase()}</span>
        <span className="eyebrow-spark">✦ TU PROPIO RITMO</span>
      </div>
      <div className="welcome">
        <div>
          <span className="overline">TU ESPACIO DE ENTRENAMIENTO</span>
          <h1>
            {greeting(today)},<br />
            <span>{shortName}.</span>
          </h1>
          <p>El próximo nivel empieza con una serie más.</p>
        </div>
        <span className="header-flourish">
          <Activity size={31} />
        </span>
      </div>

      <section className="dashboard-grid">
        <div className="card activity-card">
          <div className="card-top">
            <span className="section-label">
              <span className="lime-point" /> TU OBJETIVO SEMANAL
            </span>
            <span className="metric-badge">{pct(metrics.sessions, metrics.sessionsGoal)}% COMPLETADO</span>
          </div>
          <div className="ring-content">
            <Rings
              values={[
                {
                  label: 'Sesiones',
                  current: metrics.sessions,
                  goal: metrics.sessionsGoal,
                  color: 'var(--series-1)',
                },
                { label: 'Series', current: metrics.sets, goal: metrics.setsGoal, color: 'var(--series-2)' },
                {
                  label: 'Minutos',
                  current: metrics.minutes,
                  goal: metrics.minutesGoal,
                  color: 'var(--series-3)',
                },
              ]}
            />
            <div className="ring-legend">
              <div>
                <i style={{ background: 'var(--series-1)' }} />
                <span>Sesiones</span>
                <strong>
                  {metrics.sessions}
                  <small> / {metrics.sessionsGoal}</small>
                </strong>
              </div>
              <div>
                <i style={{ background: 'var(--series-2)' }} />
                <span>Series</span>
                <strong>
                  {metrics.sets}
                  <small> / {metrics.setsGoal}</small>
                </strong>
              </div>
              <div>
                <i style={{ background: 'var(--series-3)' }} />
                <span>Minutos</span>
                <strong>
                  {metrics.minutes}
                  <small> / {metrics.minutesGoal}</small>
                </strong>
              </div>
            </div>
          </div>
          <p className="card-footnote">
            Objetivos orientativos configurados según tus días de entrenamiento.
          </p>
        </div>

        <div className="card status-card">
          <div className="card-top">
            <span className="section-label">
              <Activity size={15} className="lime-text" /> TU RENDIMIENTO
            </span>
            <span className="status-tag">DATOS REALES</span>
          </div>
          <div className="performance-stat">
            <strong>{D(metrics.volume)}</strong>
            <span>kg·rep de volumen esta semana</span>
          </div>
          <svg
            viewBox="0 0 390 68"
            className="wave-line"
            role="img"
            aria-label="Decoración de línea de rendimiento"
          >
            <defs>
              <linearGradient id="glow-wave">
                <stop stopColor="var(--wave-a)" />
                <stop offset="1" stopColor="var(--wave-b)" />
              </linearGradient>
            </defs>
            <path
              d="M0 39 H57 l12 -15 10 30 15 -22 12 7 H215 l13 -25 12 40 14 -29 12 14 H390"
              fill="none"
              stroke="url(#glow-wave)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="performance-duo">
            <div>
              <Trophy size={17} />
              <small>Sesiones totales</small>
              <strong>{totalSessions}</strong>
            </div>
            <div>
              <Dumbbell size={17} />
              <small>Series registradas</small>
              <strong>{totalSets}</strong>
            </div>
          </div>
        </div>

        <div className="card session-card">
          <div className="card-top">
            <span className="section-label">TU PRÓXIMA SESIÓN</span>
            <span className="today-chip">{nextRoutine.isRest ? 'RECUPERACIÓN' : 'SIGUIENTE'}</span>
          </div>
          <div className="up-next-row">
            <div>
              <div className="training-kicker">{nextRoutine.tag}</div>
              <h2>{nextRoutine.name}</h2>
              <p>
                <Clock3 size={16} />{' '}
                {nextRoutine.isRest
                  ? 'Recupera energía para el próximo entrenamiento'
                  : `${nextRoutine.exercises.length} ejercicios · ${data.profile.gym}`}
              </p>
            </div>
            <button className="primary-circle" onClick={primaryAction}>
              {data.active ? 'Continuar' : nextRoutine.isRest ? 'Listo' : 'Empezar'}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>

        <div className="card quick-card">
          <div className="card-top">
            <span className="section-label">UN VISTAZO</span>
            <ArrowUpRight size={17} className="muted" />
          </div>
          <div className="mini-stats">
            <div>
              <span className="mini-icon cyan">
                <CalendarDays size={20} />
              </span>
              <small>Esta semana</small>
              <strong>
                {metrics.sessions} <em>sesiones</em>
              </strong>
            </div>
            <div>
              <span className="mini-icon lime">
                <Target size={20} />
              </span>
              <small>Objetivo</small>
              <strong>
                {metrics.sessionsGoal} <em>sesiones</em>
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="below-grid">
        <div className="section-heading">
          <div>
            <span className="overline">LO QUE VIENE</span>
            <h2>Tu ciclo de entrenamiento</h2>
          </div>
          <button className="text-link" onClick={onGoTrain}>
            Ver rutinas <ArrowRight size={15} />
          </button>
        </div>
        <div className="cycle-scroller">
          {data.routines.map((routine, index) => (
            <button
              key={routine.id}
              className={`cycle-card ${nextRoutine.id === routine.id ? 'cycle-current' : ''}`}
              onClick={() => onSkipTo(index)}
            >
              <span className="cycle-day">
                DÍA {index + 1} {nextRoutine.id === routine.id && <span>• SIGUIENTE</span>}
              </span>
              <span className="cycle-icon">
                {routine.isRest ? <Waves size={23} /> : <Dumbbell size={23} />}
              </span>
              <strong>{routine.name}</strong>
              <small>{routine.isRest ? 'Descanso' : `${routine.exercises.length} ejercicios`}</small>
            </button>
          ))}
        </div>
      </section>

      {totalSessions === 0 && (
        <div className="first-tip">
          <Sparkles size={19} />
          <div>
            <strong>Todo gran progreso empieza en cero.</strong>
            <span>Inicia tu primera sesión y verás tus estadísticas completarse automáticamente.</span>
          </div>
        </div>
      )}
    </>
  );
}
