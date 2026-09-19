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

  it('closes on a backdrop press-and-release', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal onClose={onClose} ariaLabel="Test dialog">
        <p>content</p>
      </Modal>,
    );

    const dialog = container.querySelector('dialog')!;
    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks on the panel and drags released on the backdrop', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal onClose={onClose} ariaLabel="Test dialog">
        <p>content</p>
      </Modal>,
    );

    const dialog = container.querySelector('dialog')!;
    const panel = container.querySelector('.modal-inner')!;

    // A click landing inside the panel is content, not dismissal.
    fireEvent.mouseDown(panel);
    fireEvent.click(panel);
    expect(onClose).not.toHaveBeenCalled();

    // Selecting text in the panel and releasing over the backdrop reports the
    // dialog as the click target; the press origin keeps it from dismissing.
    fireEvent.mouseDown(panel);
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
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
