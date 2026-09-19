import { useCallback, useState, type ReactNode } from 'react';
import { ConfirmDialog, type ConfirmOptions } from '../components/ConfirmDialog';

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (confirmed: boolean) => void;
}

/**
 * Promise-based confirmation dialogs. Render `confirmElement` once near the
 * root of the owning component, then `await confirm({...})` from any handler.
 */
export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  confirmElement: ReactNode;
} {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setPending({ options, resolve });
    });
  }, []);

  const confirmElement = pending ? (
    <ConfirmDialog
      {...pending.options}
      onResolve={(confirmed) => {
        pending.resolve(confirmed);
        setPending(null);
      }}
    />
  ) : null;

  return { confirm, confirmElement };
}
