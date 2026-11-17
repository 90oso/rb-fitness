'use client';
import ExercisePicker from './exercise-picker';
import type { Muscle } from '@/lib/types';

/** El selector del catálogo como hoja modal (misma hoja que el editor). Se usa desde la sesión activa. */
export default function ExercisePickerModal({
  title,
  subtitle,
  excluded,
  single = false,
  preset,
  onConfirm,
  onClose,
  onOpenDetail,
}: {
  title: string;
  subtitle?: string;
  excluded: string[];
  single?: boolean;
  preset?: Muscle[];
  onConfirm: (exerciseIds: string[]) => void;
  onClose: () => void;
  onOpenDetail: (exerciseId: string) => void;
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
          subtitle={subtitle}
          excluded={excluded}
          single={single}
          preset={preset}
          onConfirm={(ids) => {
            onConfirm(ids);
            onClose();
          }}
          onClose={onClose}
          onOpenDetail={onOpenDetail}
        />
      </div>
    </div>
  );
}
