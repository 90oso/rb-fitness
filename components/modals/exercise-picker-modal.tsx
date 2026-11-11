'use client';
import ExercisePicker from './exercise-picker';

/** El selector del catálogo como hoja modal (misma hoja que el editor). En `single` cierra al elegir uno. */
export default function ExercisePickerModal({
  title,
  excluded,
  single = false,
  onAdd,
  onClose,
}: {
  title: string;
  excluded: string[];
  single?: boolean;
  onAdd: (exerciseId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal editor-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <ExercisePicker
          title={title}
          excluded={excluded}
          single={single}
          onAdd={(id) => {
            onAdd(id);
            if (single) onClose();
          }}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
