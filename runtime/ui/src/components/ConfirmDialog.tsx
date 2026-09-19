import { useState } from 'react';
import { Modal } from './Modal';

export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When set, the user must type this exact string before confirm enables. */
  typeToConfirm?: string;
}

interface ConfirmDialogProps extends ConfirmOptions {
  onResolve: (confirmed: boolean) => void;
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  typeToConfirm,
  onResolve,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const confirmDisabled = typeToConfirm !== undefined && typed !== typeToConfirm;

  return (
    <Modal className="modal-dialog confirm-dialog" ariaLabel={title} onClose={() => onResolve(false)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!confirmDisabled) onResolve(true);
        }}
      >
        <h2>{title}</h2>
        {body ? <p className="modal-copy">{body}</p> : null}
        {typeToConfirm !== undefined ? (
          <label className="form-label">
            Type <strong>{typeToConfirm}</strong> to confirm
            <input
              className="confirm-dialog-input"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        ) : null}
        <div className="confirm-dialog-actions">
          <button type="button" className="form-btn-cancel" onClick={() => onResolve(false)}>
            {cancelLabel}
          </button>
          <button type="submit" className="confirm-btn-danger" disabled={confirmDisabled}>
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
