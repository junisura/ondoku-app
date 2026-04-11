import { formatTimeMs } from "./date.js";

export const Timer = {
  startTime: null,
  elapsedBeforePause: 0,
  timerId: null,
  isRunning: false,

  start(onTick) {
    if (this.isRunning) return;

    this.startTime = Date.now();
    this.isRunning = true;

    this.timerId = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000 + this.elapsedBeforePause;
      if (onTick) onTick(elapsed);
    }, 10);
  },

  pause() {
    clearInterval(this.timerId);

    this.elapsedBeforePause +=
      (Date.now() - this.startTime) / 1000;

    this.isRunning = false;
  },

  stop() {
    if (this.isRunning) {
      this.pause();
    }

    const total = this.elapsedBeforePause;

    this.startTime = null;
    this.elapsedBeforePause = 0;

    return total;
  },

  reset() {
    clearInterval(this.timerId);
    this.timerId = null;

    this.startTime = null;
    this.elapsedBeforePause = 0;

    this.isRunning = false;
  }

};
