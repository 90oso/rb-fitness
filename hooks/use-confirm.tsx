'use client';
import { useCallback, useState, type ReactNode } from 'react';
import ConfirmDialog, { type ConfirmOptions, type ConfirmResult } from '@/components/ui/confirm-dialog';

/** Salida de `choose()`: confirmar, cancelar (el botón) o `null` si se cerró con la X, Escape o el fondo. */
export type Choice = 'confirm' | 'cancel' | null;

interface Pending {
  options: ConfirmOptions;
  resolve: (result: ConfirmResult) => void;
}

/**
 * `const { confirm, choose, dialog } = useConfirm()` → `if (await confirm({ title: '…' })) …`
 * `confirm` responde sí/no (cerrar cuenta como no). `choose` distingue las tres salidas, para preguntas
 * donde cancelar también hace algo («Mantener rutina») y cerrar significa «todavía no».
 * Render `{dialog}` once near the root. One question at a time; a second call dismisses the first.
 */
export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  choose: (options: ConfirmOptions) => Promise<Choice>;
  dialog: ReactNode;
} {
  const [pending, setPending] = useState<Pending | null>(null);

  const ask = useCallback(
    (options: ConfirmOptions) =>
      new Promise<ConfirmResult>((resolve) => {
        setPending((previous) => {
          previous?.resolve('dismiss');
          return { options, resolve };
        });
      }),
    []
  );
  const confirm = useCallback(async (options: ConfirmOptions) => (await ask(options)) === 'confirm', [ask]);
  const choose = useCallback(
    async (options: ConfirmOptions): Promise<Choice> => {
      const result = await ask(options);
      return result === 'dismiss' ? null : result;
    },
    [ask]
  );

  const close = useCallback((result: ConfirmResult) => {
    setPending((previous) => {
      previous?.resolve(result);
      return null;
    });
  }, []);

  const dialog = pending ? <ConfirmDialog options={pending.options} onClose={close} /> : null;
  return { confirm, choose, dialog };
}
