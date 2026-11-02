'use client';
import { useCallback, useState, type ReactNode } from 'react';
import ConfirmDialog, { type ConfirmOptions } from '@/components/ui/confirm-dialog';

interface Pending {
  options: ConfirmOptions;
  resolve: (confirmed: boolean) => void;
}

/**
 * `const { confirm, dialog } = useConfirm()` → `if (await confirm({ title: '…' })) …`
 * Render `{dialog}` once near the root. One question at a time; a second call cancels the first.
 */
export function useConfirm(): { confirm: (options: ConfirmOptions) => Promise<boolean>; dialog: ReactNode } {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending((previous) => {
          previous?.resolve(false);
          return { options, resolve };
        });
      }),
    []
  );

  const close = useCallback((confirmed: boolean) => {
    setPending((previous) => {
      previous?.resolve(confirmed);
      return null;
    });
  }, []);

  const dialog = pending ? <ConfirmDialog options={pending.options} onClose={close} /> : null;
  return { confirm, dialog };
}
