export class Player {
  constructor({x, y, z}) {
    this.x = x; // Position sur l'axe X
    this.y = y; // Position sur l'axe Y (profondeur)
    this.z = z+0.7; // Hauteur (axe Z)
    this.pitch = 0;
    this.yaw = 0;
    this.direction = vec3.create();
    this.up = vec3.fromValues(0, 0, 1); // L'axe Z est maintenant l'axe vertical
    this.right = vec3.create();

    this.sensitivity = 0.002;
    this.speed = 2;
    this.flySpeed = 1;

    this._orders = [];
    this.updateVectors();
  }

  updateVectors() {
    // Calculer la direction avec Z comme axe vertical
    this.direction[0] = Math.cos(this.pitch) * Math.sin(this.yaw);
    this.direction[1] = Math.cos(this.pitch) * Math.cos(this.yaw);
    this.direction[2] = Math.sin(this.pitch); // Z est maintenant la hauteur

    vec3.normalize(this.direction, this.direction);

    // Recalculer le vecteur "right"
    vec3.cross(this.right, this.direction, this.up);
    vec3.normalize(this.right, this.right);

  }

  get dirX() {
    return this.direction[0];
  }

  get dirY() {
    return -this.direction[1];
  }

  mouseMove(dx, dy) {
    this.yaw += dx * this.sensitivity;
    this.pitch -= dy * this.sensitivity;
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    this.updateVectors();
  }

  get orders() {
    const oldOrders = this._orders;
    this._orders = [];
    return oldOrders;
  }

  update(controls, seconds) {

    if(controls.turn || controls.look) {
      this.mouseMove(controls.turn, controls.look);
      controls.turn = 0;
      controls.look = 0;
    }

    if (controls.up) {
      this.z += this.flySpeed*seconds;
    }
    if (controls.down) { 
      this.z -= this.flySpeed*seconds;
    } 

    if (controls.forward) { 
      this.x += this.direction[0] * (this.speed * seconds);
      this.y += this.direction[1] * (this.speed * seconds); // Utiliser camera.y au lieu de camera.z
    } 
    if (controls.backward) { 
      this.x -= this.direction[0] * (this.speed * seconds);
      this.y -= this.direction[1] * (this.speed * seconds); // Utiliser camera.y au lieu de camera.z
    }

    if (controls.left) {
      this.x -= this.right[0] * (this.speed * seconds);
      this.y -= this.right[1] * (this.speed * seconds); // Utiliser camera.y au lieu de camera.z
    };
    if (controls.right) {
      this.x += this.right[0] * (this.speed * seconds);
      this.y += this.right[1] * (this.speed * seconds); // Utiliser camera.y au lieu de camera.z
    };

    if (controls.togglePause) {
      this._orders.push('togglePause');
      controls.togglePause = false;
    }

    // this.physique(seconds, map);
  };
}