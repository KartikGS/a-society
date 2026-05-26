export class WakeController {
  private generation = 0;
  private waiters = new Set<() => void>();

  wake(): void {
    this.generation += 1;
    for (const waiter of this.waiters) waiter();
    this.waiters.clear();
  }

  observe(): number {
    return this.generation;
  }

  waitForWakeAfter(observed: number): { promise: Promise<void>; cancel: () => void } {
    if (this.generation !== observed) {
      return { promise: Promise.resolve(), cancel: () => {} };
    }
    let resolver: (() => void) | null = null;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
      this.waiters.add(resolve);
    });
    return { promise, cancel: () => { if (resolver) this.waiters.delete(resolver); } };
  }
}
