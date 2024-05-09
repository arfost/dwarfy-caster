export class Game {
  constructor(display, renderer, controls, settings) {
    this.frame = this.frame.bind(this);
    this.lastTime = 0;
    this.ctx = display.getContext('2d');
    this.ctx.font = "12px serif";

    this.renderer = renderer;
    this.controls = controls;

    this.worker = new Worker('/modules/worker/worker.js', { type: 'module' });

    this.worker.onmessage = ({data}) => {
      if (data.type === 'init') {
        console.log("worker init infos received", data);
        this._definitions = data.definitions;
        this.worker.onmessage = this._onRenderInfos.bind(this);
        this._finishInit();
      }
    }
    this.worker.postMessage({ type: 'init', settings });
    
    this._ready = new Promise((resolve) => {
      this._resolve = resolve;
    });

  }

  get ready() {
    return this._ready;
  }

  async _finishInit() {
    await this.renderer.initTextures(this._definitions);
    this._resolve();
  }

  _onRenderInfos(renderInfos) {
    this.renderer.updateRenderInstruction(renderInfos.data);
  }

  callback(seconds, ctx) {
    ctx.fillStyle = '#ff6600';
    ctx.fillText(Math.round(1 / seconds) + ' fps', 10, 26);

    this.renderer.render(seconds);
  }

  postControls() {
    this.worker.postMessage(this.controls.states);
    this.controls.reset();
  }

  start() {
    requestAnimationFrame(this.frame);
  };

  frame(time) {
    const seconds = (time - this.lastTime) / 1000;
    this.lastTime = time;
    
    this.callback(seconds, this.ctx);
    this.postControls();
    

    this.ctx.fillStyle = '#ff6600';
    this.ctx.fillText(Math.round(1 / seconds) + ' fps', 10, 26);
    requestAnimationFrame(this.frame);
  };
}
