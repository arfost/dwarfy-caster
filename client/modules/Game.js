export class Game {
  constructor(display, renderer, controls, settings) {
    this.frame = this.frame.bind(this);
    this.lastTime = 0;
    this.ctx = display.getContext('2d');
    this.ctx.font = "12px serif";

    this.renderer = renderer;
    this.controls = controls;

    this.worker = new Worker('/modules/worker/worker.js', { type: 'module' });

    this.worker.onmessage = this._handleWorkerMessage.bind(this);
    this.worker.postMessage({ type: 'init', settings });
    
    this._ready = new Promise((resolve) => {
      this._resolve = resolve;
    });

    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.currentFps = 0;
  }

  get ready() {
    return this._ready;
  }

  _handleWorkerMessage({data}) {
    if (data.type === 'init') {
      console.log("worker init infos received", data);
      this._definitions = data.definitions;
      this._finishInit();
    } else if (data.type === 'renderInfos') {
      this.renderer.updateRenderInstruction(data.data);
    }
  }

  async _finishInit() {
    await this.renderer.initTextures(this._definitions);
    this._resolve();
  }

  start() {
    requestAnimationFrame(this.frame);
  }

  frame(time) {
    const seconds = (time - this.lastTime) / 1000;
    this.lastTime = time;
    
    this.updateFps(time);
    this.renderer.render(seconds);
    this.postControls();
    
    this.drawFps();
    requestAnimationFrame(this.frame);
  }

  updateFps(time) {
    this.frameCount++;
    if (time - this.lastFpsUpdate >= 1000) {
      this.currentFps = Math.round(this.frameCount / ((time - this.lastFpsUpdate) / 1000));
      this.frameCount = 0;
      this.lastFpsUpdate = time;
    }
  }

  drawFps() {
    this.ctx.fillStyle = '#ff6600';
    this.ctx.fillText(this.currentFps + ' fps', 10, 26);
  }

  postControls() {
    this.worker.postMessage(this.controls.states);
    this.controls.reset();
  }
}