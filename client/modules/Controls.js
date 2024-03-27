export class Controls {
  constructor() {
    this.codes = { 81: 'left', 68: 'right', 90: 'forward', 83: 'backward', 69: 'up', 65: 'down'};
    this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false, 'up': false, 'down': false};
    document.addEventListener('keydown', this.onKey.bind(this, true), false);
    document.addEventListener('keyup', this.onKey.bind(this, false), false);
    //setup mouse listener
    document.addEventListener('mousemove', this.onMouseMove.bind(this), false);

  }

  onKey(val, e) {
    var state = this.codes[e.keyCode];
    if (typeof state === 'undefined') return;
    this.states[state] = val;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
  };

  onMouseMove(e) {
    this.states['turn'] = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    this.states['look'] = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
  };
}