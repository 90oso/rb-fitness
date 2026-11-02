'use client';
import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
}

/** RB-styled replacement for window.confirm(); focus starts on Cancel so Enter never destroys by accident. */
export default function ConfirmDialog({
  options,
  onClose,
}: {
  options: ConfirmOptions;
  onClose: (confirmed: boolean) => void;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={() => onClose(false)}>
      <div
        className="modal confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={options.message ? 'confirm-message' : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" aria-label="Cerrar" onClick={() => onClose(false)}>
          <X size={21} />
        </button>
        <span className={`confirm-icon ${options.danger ? 'confirm-icon-danger' : ''}`}>
          <AlertTriangle size={22} />
        </span>
        <h2 id="confirm-title">{options.title}</h2>
        {options.message && (
          <p id="confirm-message" className="confirm-message">
            {options.message}
          </p>
        )}
        <div className="confirm-actions">
          <button ref={cancelRef} className="secondary-btn" onClick={() => onClose(false)}>
            {options.cancelLabel ?? 'Cancelar'}
          </button>
          <button className={options.danger ? 'danger-btn' : 'lime-btn'} onClick={() => onClose(true)}>
            {options.confirmLabel ?? 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
