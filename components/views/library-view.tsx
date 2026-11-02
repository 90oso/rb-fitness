'use client';
import { useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { Empty, PageHead } from '@/components/ui/bits';
import { ExerciseThumb } from '@/components/ui/exercise-media';
import { catalog, equipmentKinds, majorMuscles } from '@/lib/catalog';

export default function LibraryView({ onOpenExercise }: { onOpenExercise: (exerciseId: string) => void }) {
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('Todos');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('Todos');
  const needle = search.trim().toLowerCase();
  const results = catalog.filter(
    (exercise) =>
      (muscleFilter === 'Todos' || exercise.muscle === muscleFilter) &&
      (equipmentFilter === 'Todos' || exercise.equipment === equipmentFilter) &&
      `${exercise.name} ${exercise.equipment} ${exercise.muscle}`.toLowerCase().includes(needle)
  );

  return (
    <>
      <PageHead
        overline="APRENDE CADA MOVIMIENTO"
        title="Conoce tus ejercicios."
        sub={`${catalog.length} ejercicios con el equipo habitual de Planet Fitness. Toca uno para ver cómo se hace.`}
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
      <div className="filter-scroll" aria-label="Filtrar por músculo">
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
      <div className="filter-scroll filter-secondary" aria-label="Filtrar por equipo">
        <button
          className={equipmentFilter === 'Todos' ? 'chosen' : ''}
          onClick={() => setEquipmentFilter('Todos')}
        >
          Todo el equipo
        </button>
        {equipmentKinds.map((kind) => (
          <button
            key={kind}
            className={equipmentFilter === kind ? 'chosen' : ''}
            onClick={() => setEquipmentFilter(kind)}
          >
            {kind}
          </button>
        ))}
      </div>
      <div className="catalog-grid">
        {results.map((exercise) => (
          <button key={exercise.id} className="exercise-tile" onClick={() => onOpenExercise(exercise.id)}>
            <ExerciseThumb exercise={exercise} size={56} />
            <span>
              <small>
                {exercise.muscle.toUpperCase()} • {exercise.equipment.toUpperCase()}
              </small>
              <strong>{exercise.name}</strong>
              <em>
                Ver cómo se hace <ArrowUpRight size={14} />
              </em>
            </span>
          </button>
        ))}
      </div>
      {results.length === 0 && (
        <Empty
          icon={Search}
          title="Sin resultados"
          text="Prueba con otro nombre, músculo o tipo de equipo."
        />
      )}
    </>
  );
}
