'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const TOAST_MS = 3400;

export function useToast(): { toast: (message: string) => void; toastNode: ReactNode } {
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const toast = useCallback((message: string) => {
    setNotice(message);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(null), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  const toastNode = notice ? (
    <div role="status" className="toast">
      <CheckCircle2 size={19} />
      {notice}
      <button onClick={() => setNotice(null)} aria-label="Cerrar aviso">
        <X size={15} />
      </button>
    </div>
  ) : null;

  return { toast, toastNode };
}
