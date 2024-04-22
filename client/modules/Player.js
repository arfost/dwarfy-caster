const CIRCLE = Math.PI * 2;
const MOVE_SPEED = 5;

export class Player {
  constructor({x, y, z}, upDirection = 0) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.dirX = -1;
    this.dirY = 0;

    this.planeX = 0;
    this.planeY = 0.66;

    this.upDirection = upDirection;
    this.weapon = 'rabbit';
    this.paces = 0;
    this.lastValidPosition = { x: this.x, y: this.y, z: this.z };
  }

  rotate(angle) {
    //this.direction = (this.direction + angle + CIRCLE) % (CIRCLE);
    let oldDirX = this.dirX;
    this.dirX = this.dirX * Math.cos(-angle) - this.dirY * Math.sin(-angle);
    this.dirY = oldDirX * Math.sin(-angle) + this.dirY * Math.cos(-angle);
    
    let oldPlaneX = this.planeX;
    this.planeX = this.planeX * Math.cos(-angle) - this.planeY * Math.sin(-angle);
    this.planeY = oldPlaneX * Math.sin(-angle) + this.planeY * Math.cos(-angle);
  };

  rotateZ(angle) {
    //only if angle is not already 45 degrees

    this.upDirection = this.upDirection - angle;
    if(this.upDirection < -0.5 || this.upDirection > 0.5){
      this.upDirection = this.upDirection + angle;
    }
  };

  get zRest() {
    return this.z - Math.floor(this.z);
  }

  fly(distance, map) {
    this.z += distance;
    if(!map.wallGrids[Math.floor(this.z)]){
      this.z-=distance;
    }
  };

  walk(distance, map) {
    // var dx = Math.cos(this.direction) * distance;
    // var dy = Math.sin(this.direction) * distance;
    // this.x += dx;
    // this.y += dy;
    this.x += this.dirX * distance;
    this.y += this.dirY * distance;
    this.paces += distance;
    
  };

  strafe(distance, map) {
    // var dx = Math.cos(this.direction + Math.PI/2) * distance;
    // var dy = Math.sin(this.direction + Math.PI/2) * distance;
    // this.x += dx;
    // this.y += dy;
    this.x += this.planeX * distance;
    this.y += this.planeY * distance;
    this.paces += distance;
  };

  physique(seconds, map) {
    const currentBlock = map.getCellProperties(map.getWall(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z)));
    if (currentBlock && currentBlock.stopView) {
      this.x = this.lastValidPosition.x;
      this.y = this.lastValidPosition.y;
      this.z = this.lastValidPosition.z;
      return;
    }
    if(this.zRest > 0.1) {
      this.z -= 0.5*seconds;
    }
    this.lastValidPosition.x = this.x;
    this.lastValidPosition.y = this.y;
    this.lastValidPosition.z = this.z;
  }

  update(controls, map, seconds) {
    if (controls.left) {
      this.strafe(-MOVE_SPEED*2 * seconds, map)
    };
    if (controls.right) {
      this.strafe(MOVE_SPEED*2 * seconds, map)
    };

    if (controls.look) {
      this.rotateZ(controls.look  * Math.PI * seconds * 0.1);
      controls.look = 0;
    };
    if (controls.turn) {
      this.rotate(-controls.turn  * Math.PI * seconds * 0.1);
      controls.turn = 0;
    };

    if (controls.up) {
      this.fly(MOVE_SPEED*0.5 * seconds, map)
    }
    if (controls.down) { 
      this.fly(-MOVE_SPEED*0.5 * seconds, map) 
    } 

    if (controls.forward) { 
      this.walk(-MOVE_SPEED * seconds, map) 
    } 
    if (controls.backward) { 
      this.walk(MOVE_SPEED * seconds, map);
    }

    if(controls.teleport) {
      controls.teleport = false;
      map.teleportToCursor(this);
    }
    this.physique(seconds, map);
  };
}
