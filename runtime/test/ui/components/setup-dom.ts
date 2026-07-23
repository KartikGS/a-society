/**
 * Shared DOM shims for component specs. jsdom ships <dialog> support, but the
 * guard keeps the suite resilient if the environment lacks showModal/close.
 */
export function ensureMatchMediaSupport(): void {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'function') return;
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
}

export function ensureDialogSupport(): void {
  if (typeof HTMLDialogElement === 'undefined') return;
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  }
}
