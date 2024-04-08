export class Game {
  constructor(display) {
    this.frame = this.frame.bind(this);
    this.lastTime = 0;
    this.ctx = display.getContext('2d');
    this.callback = function () { };
    this.ctx.font = "12px serif";
  }

  start(callback) {
    this.callback = callback;
    requestAnimationFrame(this.frame);
  };

  frame(time) {
    const seconds = (time - this.lastTime) / 1000;
    this.lastTime = time;
    if (seconds < 0.2) this.callback(seconds, this.ctx);
    this.ctx.fillStyle = '#ff6600';
    this.ctx.fillText(Math.round(1 / seconds) + ' fps', 10, 26);
    requestAnimationFrame(this.frame);
  };
}
