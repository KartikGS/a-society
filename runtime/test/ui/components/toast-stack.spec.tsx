// @vitest-environment jsdom
// The Popover API is stubbed: jsdom does not open popovers, so queries include hidden elements.
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastStack, type Toast } from '../../../ui/src/components/ToastStack';

const showPopover = vi.fn();
const hidePopover = vi.fn();
const original = {
  show: HTMLElement.prototype.showPopover,
  hide: HTMLElement.prototype.hidePopover,
};

beforeEach(() => {
  showPopover.mockReset();
  hidePopover.mockReset();
  HTMLElement.prototype.showPopover = showPopover;
  HTMLElement.prototype.hidePopover = hidePopover;
});

afterEach(() => {
  cleanup();
  HTMLElement.prototype.showPopover = original.show;
  HTMLElement.prototype.hidePopover = original.hide;
});

const saved: Toast = { id: 1, message: 'New flows will run on Claude Code.', tone: 'success' };
const failed: Toast = { id: 2, message: 'Executable path must be absolute.', tone: 'error' };

describe('ToastStack', () => {
  it('shows toasts in the top layer, re-raising the popover so it stays above an open dialog', () => {
    const { rerender } = render(<ToastStack toasts={[]} onDismiss={vi.fn()} />);
    expect(showPopover).not.toHaveBeenCalled();

    rerender(<ToastStack toasts={[saved]} onDismiss={vi.fn()} />);
    expect(showPopover).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('New flows will run on Claude Code.');

    rerender(<ToastStack toasts={[saved, failed]} onDismiss={vi.fn()} />);
    expect(hidePopover).toHaveBeenCalledTimes(1);
    expect(showPopover).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('alert', { hidden: true })).toHaveTextContent('Executable path must be absolute.');

    rerender(<ToastStack toasts={[]} onDismiss={vi.fn()} />);
    expect(hidePopover).toHaveBeenCalledTimes(2);
    expect(showPopover).toHaveBeenCalledTimes(2);
  });

  it('dismisses a toast', async () => {
    const onDismiss = vi.fn();
    render(<ToastStack toasts={[saved]} onDismiss={onDismiss} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dismiss notification', hidden: true }));
    expect(onDismiss).toHaveBeenCalledWith(1);
  });
});
