export class Spinner {
  private static frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  private index = 0;
  private timer?: NodeJS.Timeout;
  private running = false;

  start(label = 'Thinking...'): void {
    if (!process.stderr.isTTY) return;
    this.running = true;
    this.timer = setInterval(() => {
      const frame = Spinner.frames[this.index % Spinner.frames.length];
      process.stderr.write(`\r${frame} ${label}`);
      this.index++;
    }, 80);
  }

  stop(): void {
    if (!this.running) return;
    clearInterval(this.timer);
    this.running = false;
    if (process.stderr.isTTY) {
      process.stderr.write('\r\x1b[K');
    }
  }
}
