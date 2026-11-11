'use client';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
  /** Extra safeguard for irreversible actions: the confirm button stays disabled until this word is typed. */
  requireText?: string;
}

/** Cómo se cerró el diálogo: el botón de confirmar, el de cancelar, o la X / Escape / el fondo. */
export type ConfirmResult = 'confirm' | 'cancel' | 'dismiss';

/** RB-styled replacement for window.confirm(); focus starts on Cancel so Enter never destroys by accident. */
export default function ConfirmDialog({
  options,
  onClose,
}: {
  options: ConfirmOptions;
  onClose: (result: ConfirmResult) => void;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const [typed, setTyped] = useState('');
  const unlocked = !options.requireText || typed.trim().toLowerCase() === options.requireText.toLowerCase();
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose('dismiss');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={() => onClose('dismiss')}>
      <div
        className="modal confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={options.message ? 'confirm-message' : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" aria-label="Cerrar" onClick={() => onClose('dismiss')}>
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
        {options.requireText && (
          <label className="form-label confirm-type">
            Para continuar, escribe «{options.requireText}»
            <input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label={`Escribe ${options.requireText} para confirmar`}
            />
          </label>
        )}
        <div className="confirm-actions">
          <button ref={cancelRef} className="secondary-btn" onClick={() => onClose('cancel')}>
            {options.cancelLabel ?? 'Cancelar'}
          </button>
          <button
            className={options.danger ? 'danger-btn' : 'lime-btn'}
            disabled={!unlocked}
            onClick={() => onClose('confirm')}
          >
            {options.confirmLabel ?? 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
