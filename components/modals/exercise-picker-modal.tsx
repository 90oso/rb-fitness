'use client';
import { createPortal } from 'react-dom';
import ExercisePicker from './exercise-picker';
import type { Muscle } from '@/lib/types';

/**
 * El selector del catálogo como hoja modal (misma hoja que el editor). Se usa desde la sesión activa y el
 * arranque. Va en un portal al `body`: dentro de un panel con `backdrop-filter`, `position: fixed` quedaría
 * relativo al panel y la hoja saldría de la pantalla.
 */
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
  const sheet = (
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
  return typeof document === 'undefined' ? sheet : createPortal(sheet, document.body);
}
