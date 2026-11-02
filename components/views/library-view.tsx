'use client';
import { useState } from 'react';
import { ArrowUpRight, Dumbbell, Search } from 'lucide-react';
import { Empty, PageHead } from '@/components/ui/bits';
import { catalog, majorMuscles } from '@/lib/catalog';

export default function LibraryView({ onOpenExercise }: { onOpenExercise: (exerciseId: string) => void }) {
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('Todos');
  const needle = search.trim().toLowerCase();
  const results = catalog.filter(
    (exercise) =>
      (muscleFilter === 'Todos' || exercise.muscle === muscleFilter) &&
      `${exercise.name} ${exercise.equipment} ${exercise.muscle}`.toLowerCase().includes(needle)
  );

  return (
    <>
      <PageHead
        overline="APRENDE CADA MOVIMIENTO"
        title="Conoce tus ejercicios."
        sub="Una guía inicial editable y centrada en equipos habituales de Planet Fitness. Confirma siempre el modelo y sus ajustes en el gimnasio."
      />
      <div className="search-row">
        <label className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busca un ejercicio o máquina..."
            aria-label="Buscar ejercicio"
          />
        </label>
      </div>
      <div className="filter-scroll">
        <button className={muscleFilter === 'Todos' ? 'chosen' : ''} onClick={() => setMuscleFilter('Todos')}>
          Todos
        </button>
        {majorMuscles.map((muscle) => (
          <button
            key={muscle}
            className={muscleFilter === muscle ? 'chosen' : ''}
            onClick={() => setMuscleFilter(muscle)}
          >
            {muscle}
          </button>
        ))}
      </div>
      <div className="catalog-grid">
        {results.map((exercise) => (
          <button key={exercise.id} className="exercise-tile" onClick={() => onOpenExercise(exercise.id)}>
            <span className="exercise-icon">
              <Dumbbell size={25} />
            </span>
            <span>
              <small>
                {exercise.muscle.toUpperCase()} • {exercise.equipment.toUpperCase()}
              </small>
              <strong>{exercise.name}</strong>
              <em>
                Ver cómo se usa <ArrowUpRight size={14} />
              </em>
            </span>
          </button>
        ))}
      </div>
      {results.length === 0 && (
        <Empty icon={Search} title="Sin resultados" text="Intenta buscar otra máquina o grupo muscular." />
      )}
    </>
  );
}
