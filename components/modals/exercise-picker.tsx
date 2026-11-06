'use client';
import { useState } from 'react';
import { ArrowLeft, Check, Plus, Search } from 'lucide-react';
import { ExerciseThumb } from '@/components/ui/exercise-media';
import { catalog, majorMuscles } from '@/lib/catalog';

/** Searchable list to add exercises to a routine. Stays open so several can be added in a row. */
export default function ExercisePicker({
  excluded,
  onAdd,
  onClose,
}: {
  excluded: string[];
  onAdd: (exerciseId: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState<string>('Todos');
  const [added, setAdded] = useState<string[]>([]);
  const needle = search.trim().toLowerCase();
  const results = catalog.filter(
    (exercise) =>
      (muscle === 'Todos' || exercise.muscle === muscle) &&
      `${exercise.name} ${exercise.equipment} ${exercise.muscle}`.toLowerCase().includes(needle)
  );

  return (
    <div className="picker">
      <div className="picker-head">
        <button type="button" className="icon-action" onClick={onClose} aria-label="Volver a la rutina">
          <ArrowLeft size={20} />
        </button>
        <div>
          <strong>Añadir ejercicios</strong>
          <small>
            {added.length ? `${added.length} añadido${added.length === 1 ? '' : 's'}` : 'Toca + para añadir'}
          </small>
        </div>
        <button type="button" className="lime-btn picker-done" onClick={onClose}>
          Listo <Check size={16} />
        </button>
      </div>
      <label className="search-field picker-search">
        <Search size={18} />
        <input
          autoFocus
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, músculo o máquina"
          aria-label="Buscar ejercicio"
        />
      </label>
      <div className="filter-scroll">
        <button
          type="button"
          className={muscle === 'Todos' ? 'chosen' : ''}
          onClick={() => setMuscle('Todos')}
        >
          Todos
        </button>
        {majorMuscles.map((m) => (
          <button type="button" key={m} className={muscle === m ? 'chosen' : ''} onClick={() => setMuscle(m)}>
            {m}
          </button>
        ))}
      </div>
      <ul className="picker-list">
        {results.map((exercise) => {
          const inRoutine = excluded.includes(exercise.id) || added.includes(exercise.id);
          return (
            <li key={exercise.id} className={`picker-row ${inRoutine ? 'picker-row-added' : ''}`}>
              <ExerciseThumb exercise={exercise} size={44} />
              <div>
                <strong>{exercise.name}</strong>
                <small>
                  {exercise.muscle} · {exercise.equipment}
                </small>
              </div>
              <button
                type="button"
                className="picker-add"
                disabled={inRoutine}
                aria-label={inRoutine ? `${exercise.name} ya está en la rutina` : `Añadir ${exercise.name}`}
                onClick={() => {
                  onAdd(exercise.id);
                  setAdded((list) => [...list, exercise.id]);
                }}
              >
                {inRoutine ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </li>
          );
        })}
        {results.length === 0 && <li className="picker-empty">Sin resultados para esa búsqueda.</li>}
      </ul>
    </div>
  );
}
