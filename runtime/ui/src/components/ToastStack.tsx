import { X } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';

export type ToastTone = 'error' | 'success';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastStackProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

/**
 * Notifications, shown as a manual popover so they render in the browser's top layer.
 * An open modal `<dialog>` (Settings, for example) also lives there and would otherwise
 * cover the toasts; re-showing the popover on every change keeps it above any open dialog.
 */
export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  const stackRef = useRef<HTMLDivElement | null>(null);
  const openRef = useRef(false);

  useLayoutEffect(() => {
    const stack = stackRef.current;
    // Browsers without the Popover API fall back to the fixed-position stack.
    if (!stack || typeof stack.showPopover !== 'function') return;
    if (openRef.current) stack.hidePopover();
    openRef.current = toasts.length > 0;
    if (openRef.current) stack.showPopover();
  }, [toasts]);

  return (
    <div ref={stackRef} className="toast-stack" popover="manual">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.tone}`}
          role={toast.tone === 'error' ? 'alert' : 'status'}
        >
          <span className="toast-message">{toast.message}</span>
          <button
            type="button"
            className="toast-dismiss"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(toast.id)}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
