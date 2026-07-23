// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '../../../ui/src/components/ConfirmDialog';
import { ensureDialogSupport } from './setup-dom';

beforeAll(ensureDialogSupport);
afterEach(cleanup);

describe('ConfirmDialog', () => {
  it('resolves true on confirm and false on cancel', () => {
    const onResolve = vi.fn();
    render(
      <ConfirmDialog
        title="Delete 'demo'?"
        body="This cannot be undone."
        confirmLabel="Delete flow"
        onResolve={onResolve}
      />,
    );

    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete flow' }));
    expect(onResolve).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onResolve).toHaveBeenLastCalledWith(false);
  });

  it('keeps confirm disabled until the type-to-confirm text matches', async () => {
    const user = userEvent.setup();
    const onResolve = vi.fn();
    render(
      <ConfirmDialog
        title="Delete project?"
        confirmLabel="Delete project"
        typeToConfirm="my-project"
        onResolve={onResolve}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: 'Delete project' });
    expect(confirmButton).toBeDisabled();

    const input = screen.getByRole('textbox');
    await user.type(input, 'my-proj');
    expect(confirmButton).toBeDisabled();

    await user.type(input, 'ect');
    expect(confirmButton).toBeEnabled();

    fireEvent.click(confirmButton);
    expect(onResolve).toHaveBeenLastCalledWith(true);
  });

  it('resolves false when the dialog is cancelled via Escape', () => {
    const onResolve = vi.fn();
    const { container } = render(
      <ConfirmDialog title="Delete?" onResolve={onResolve} />,
    );

    const dialog = container.querySelector('dialog');
    expect(dialog).not.toBeNull();
    fireEvent(dialog!, new Event('cancel', { bubbles: false, cancelable: true }));
    expect(onResolve).toHaveBeenLastCalledWith(false);
  });
});
