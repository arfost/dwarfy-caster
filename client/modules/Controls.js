const AZERTY = {
  81:'left',
  68:'right',
  90:'forward',
  83:'backward',
  69:'up',
  65:'down',
  88:'teleport',
  67: 'resetChunk',
  32: 'pause',
};

const QWERTY = {
  65:'left',
  68:'right',
  87:'forward',
  83:'backward',
  69:'up',
  81:'down',
  88:'teleport',
  67: 'resetChunk',
  32: 'pause',
};

export class Controls {
  constructor() {
    this.specialKeys = {
      80: this._changeControlScheme.bind(this),
    }
    this.codes = AZERTY;
    this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false, 'up': false, 'down': false, 'teleport': false, 'resetChunk': false, 'pause': false, 'turn': 0, 'look': 0};
    document.addEventListener('keydown', this.onKey.bind(this, true), false);
    document.addEventListener('keyup', this.onKey.bind(this, false), false);
    //setup mouse listener
    document.addEventListener('mousemove', this.onMouseMove.bind(this), false);

  }

  _changeControlScheme() {
    if(this.codes === AZERTY) {
      console.log("Switching to QWERTY");
      this.codes = QWERTY;
    }else{
      console.log("Switching to AZERTY");
      this.codes = AZERTY;
    }
  }

  onKey(val, e) {
    if(this.specialKeys[e.keyCode] && val){
      this.specialKeys[e.keyCode]();
      return;
    }
    const state = this.codes[e.keyCode];
    if (typeof state === 'undefined') return;
    this.states[state] = val;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
  };

  onMouseMove(e) {
    if(this.states['turn'] || this.states['look']) return;
    this.states['turn'] = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    this.states['look'] = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
  };
}