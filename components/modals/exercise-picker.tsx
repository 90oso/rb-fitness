'use client';
import { useState } from 'react';
import { Check, Play, Search, X } from 'lucide-react';
import { ExercisePhoto } from '@/components/ui/exercise-media';
import { catalog, majorMuscles } from '@/lib/catalog';
import type { Exercise } from '@/lib/types';

/**
 * Catálogo para elegir ejercicios. La fila entera marca o desmarca; la foto abre «Cómo se hace» sin perder
 * lo elegido. Agrupado por músculo, con buscador y filtros fijos arriba y el botón «Añadir N ejercicios» abajo.
 * En `single` (sustituir en sesión) no hay pie: tocar una fila confirma esa elección.
 */
export default function ExercisePicker({
  excluded,
  title = 'Añadir ejercicios',
  subtitle,
  single = false,
  onConfirm,
  onClose,
  onOpenDetail,
}: {
  /** Ya están en la rutina o la sesión: se muestran marcados y no se pueden volver a elegir. */
  excluded: string[];
  title?: string;
  subtitle?: string;
  single?: boolean;
  onConfirm: (exerciseIds: string[]) => void;
  onClose: () => void;
  onOpenDetail: (exerciseId: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState<string>('Todos');
  const [selected, setSelected] = useState<string[]>([]);
  // Con dedo, el teclado del teléfono taparía las fotos: solo se enfoca el buscador cuando hay ratón.
  const [focusSearch] = useState(
    () => typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches
  );
  const needle = search.trim().toLowerCase();
  const results = catalog.filter(
    (exercise) =>
      (muscle === 'Todos' || exercise.muscle === muscle) &&
      `${exercise.name} ${exercise.equipment} ${exercise.muscle}`.toLowerCase().includes(needle)
  );
  const groups = majorMuscles
    .map((m) => ({ muscle: m, items: results.filter((exercise) => exercise.muscle === m) }))
    .filter((group) => group.items.length > 0);

  const toggle = (exercise: Exercise) => {
    if (single) {
      onConfirm([exercise.id]);
      return;
    }
    setSelected((list) =>
      list.includes(exercise.id) ? list.filter((id) => id !== exercise.id) : [...list, exercise.id]
    );
  };
  const count = selected.length;
  const hint = single
    ? 'Toca un ejercicio para elegirlo'
    : count === 0
      ? 'Toca un ejercicio para marcarlo'
      : `${count} ${count === 1 ? 'elegido' : 'elegidos'}`;

  return (
    <div className="picker">
      <div className="picker-head">
        <button type="button" className="icon-action" onClick={onClose} aria-label="Cerrar selector">
          <X size={20} />
        </button>
        <div>
          <strong>{title}</strong>
          <small>{subtitle ? `${subtitle} · ${hint}` : hint}</small>
        </div>
      </div>
      <label className="search-field picker-search">
        <Search size={18} />
        <input
          autoFocus={focusSearch}
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
      <div className="picker-list">
        {groups.map((group) => (
          <section className="picker-group" key={group.muscle} aria-labelledby={`picker-${group.muscle}`}>
            <h3 className="picker-group-title" id={`picker-${group.muscle}`}>
              {group.muscle}
            </h3>
            {group.items.map((exercise) => {
              const inRoutine = excluded.includes(exercise.id);
              const isSelected = inRoutine || selected.includes(exercise.id);
              return (
                <div
                  key={exercise.id}
                  className={`picker-row ${isSelected ? 'picker-row-selected' : ''} ${inRoutine ? 'picker-row-added' : ''}`}
                >
                  <button
                    type="button"
                    className="picker-photo"
                    onClick={() => onOpenDetail(exercise.id)}
                    aria-label={`Ver cómo se hace ${exercise.name}`}
                  >
                    <ExercisePhoto exercise={exercise} width={96} height={64} />
                    <span className="picker-play" aria-hidden="true">
                      <Play size={11} strokeWidth={3} />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="picker-toggle"
                    aria-pressed={single ? undefined : isSelected}
                    disabled={inRoutine}
                    onClick={() => toggle(exercise)}
                  >
                    <span className="picker-name">
                      <strong>{exercise.name}</strong>
                      <small>{inRoutine ? 'Ya está en la rutina' : exercise.equipment}</small>
                    </span>
                    {!single && (
                      <span className="picker-check" aria-hidden="true">
                        {isSelected && <Check size={16} strokeWidth={3} />}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </section>
        ))}
        {results.length === 0 && <p className="picker-empty">Sin resultados para esa búsqueda.</p>}
      </div>
      {!single && (
        <div className="picker-foot">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="lime-btn picker-confirm"
            disabled={count === 0}
            onClick={() => onConfirm(selected)}
          >
            Añadir {count === 0 ? 'ejercicios' : `${count} ${count === 1 ? 'ejercicio' : 'ejercicios'}`}
          </button>
        </div>
      )}
    </div>
  );
}
