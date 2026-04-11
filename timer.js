window.Timer = {
  startTime: null,
  elapsedBeforePause: 0,
  timerId: null,
  isRunning: false,

  start() {
    this.startTime = Date.now();
    this.isRunning = true;

    this.timerId = setInterval(() => {
      const elapsed =
        (Date.now() - this.startTime) / 1000 + this.elapsedBeforePause;

      document.getElementById("timerText").textContent =
        Common.formatTimeMs(elapsed);
    }, 100);
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
  }
};