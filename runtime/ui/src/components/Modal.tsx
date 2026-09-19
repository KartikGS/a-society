import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  /** Invoked when the user dismisses the dialog (Esc or backdrop click). */
  onClose: () => void;
  /** Required dialogs cannot be dismissed; the user must pick an action inside. */
  required?: boolean;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

/**
 * Native <dialog> wrapper. The browser top layer provides focus trapping,
 * Esc handling (via the cancel event), and ::backdrop rendering. The parent
 * controls visibility by mounting/unmounting; focus returns to the previously
 * focused element on unmount.
 */
export function Modal({ onClose, required = false, className, ariaLabel, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pressTargetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  return (
    // Backdrop clicks are a pointer-only dismiss affordance; keyboard users dismiss via Esc (the cancel event).
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className={className}
      aria-label={ariaLabel}
      onCancel={(event) => {
        event.preventDefault();
        if (!required) onClose();
      }}
      onMouseDown={(event) => { pressTargetRef.current = event.target; }}
      onClick={(event) => {
        // ::backdrop is a pseudo-element, so backdrop clicks report the dialog
        // as their target. The inner panel absorbs every click on the dialog's
        // own box, which leaves the dialog itself as a backdrop-only target.
        // Requiring the press to start there too keeps a text selection dragged
        // out of the panel from dismissing it.
        if (required || event.target !== dialogRef.current) return;
        if (pressTargetRef.current !== dialogRef.current) return;
        onClose();
      }}
    >
      <div className="modal-inner">{children}</div>
    </dialog>
  );
}
