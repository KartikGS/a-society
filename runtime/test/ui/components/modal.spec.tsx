// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Modal } from '../../../ui/src/components/Modal';
import { ensureDialogSupport } from './setup-dom';

beforeAll(ensureDialogSupport);
afterEach(cleanup);

describe('Modal', () => {
  it('invokes onClose when cancelled (Escape)', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal onClose={onClose} ariaLabel="Test dialog">
        <p>content</p>
      </Modal>,
    );

    const dialog = container.querySelector('dialog');
    fireEvent(dialog!, new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('required dialogs ignore cancel and stay open', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal required onClose={onClose} ariaLabel="Required dialog">
        <p>content</p>
      </Modal>,
    );

    const dialog = container.querySelector('dialog');
    fireEvent(dialog!, new Event('cancel', { cancelable: true }));
    expect(onClose).not.toHaveBeenCalled();
    expect(dialog!.open).toBe(true);
  });

  it('labels the dialog for assistive tech', () => {
    const { container } = render(
      <Modal onClose={() => {}} ariaLabel="Settings">
        <p>content</p>
      </Modal>,
    );
    expect(container.querySelector('dialog')).toHaveAttribute('aria-label', 'Settings');
  });
});
