export class Spinner {
  private static frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  private index = 0;
  private timer?: NodeJS.Timeout;
  private running = false;
  private stream: NodeJS.WritableStream;

  constructor(stream: NodeJS.WritableStream = process.stderr) {
    this.stream = stream;
  }

  start(label: string): void {
    const isTTY = (this.stream as any).isTTY;
    if (!isTTY) {
      this.stream.write(`${label}\n`);
      return;
    }
    this.running = true;
    this.timer = setInterval(() => {
      const frame = Spinner.frames[this.index % Spinner.frames.length];
      this.stream.write(`\r${frame} ${label}`);
      this.index++;
    }, 80);
  }

  stop(): void {
    if (!this.running) return;
    clearInterval(this.timer);
    this.running = false;
    const isTTY = (this.stream as any).isTTY;
    if (isTTY) {
      this.stream.write('\r\x1b[K');
    }
  }
}
