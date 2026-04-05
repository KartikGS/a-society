export class Spinner {
    static frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    index = 0;
    timer;
    running = false;
    start(label = 'Thinking...') {
        if (!process.stderr.isTTY)
            return;
        this.running = true;
        this.timer = setInterval(() => {
            const frame = Spinner.frames[this.index % Spinner.frames.length];
            process.stderr.write(`\r${frame} ${label}`);
            this.index++;
        }, 80);
    }
    stop() {
        if (!this.running)
            return;
        clearInterval(this.timer);
        this.running = false;
        if (process.stderr.isTTY) {
            process.stderr.write('\r\x1b[K');
        }
    }
}
