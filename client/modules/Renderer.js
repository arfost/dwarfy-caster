const COLORS = {
  white: [255, 255, 255, 255],
  black: [0, 0, 0, 255],
  red: [255, 0, 0, 255],
  green: [0, 255, 0, 255],
  blue: [0, 0, 255, 255],
  yellow: [255, 255, 0, 255],
  cyan: [0, 255, 255, 255],
  magenta: [255, 0, 255, 255],
  gray: [128, 128, 128, 255],
  darkGray: [64, 64, 64, 255],
  lightGray: [192, 192, 192, 255],
  orange: [255, 200, 0, 255],
}

export class Renderer{
  constructor(display, resolution){

    this.display = display;
    this.ctx = display.getContext('2d');
    
    // this.width = display.width = Math.floor(window.innerWidth*0.5);
    // this.height = display.height = Math.floor(window.innerHeight*0.5);

    this.width = display.width = 640;
    this.height = display.height = 480;
    this.resolution = resolution;
    this.spacing = Math.floor(this.width / resolution);

    this.pixelsData = this.ctx.createImageData(this.width, this.height);

  };

  writePixel(x, y, pixel){
    if(x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const index = (x * 4) + (y * this.width * 4);
    this.pixelsData.data[index + 0] = pixel[0];
    this.pixelsData.data[index + 1] = pixel[1];
    this.pixelsData.data[index + 2] = pixel[2];
    this.pixelsData.data[index + 3] = pixel[3];
  }

  writeColumn(x, y, height, color = [128, 128, 128, 255]){
    y = Math.floor(y);
    height = Math.floor(height);

    // if(y < 0) y = 0;
    // if(y >= this.height) y = this.height - 1;
    // if(y+height > this.height) height = this.height-y;
    // if(height < 0) height = 0;

    // this.ctx.fillStyle = "#00ff00";
    // //console.log("writeColumn", x, y, height, color);
    // this.ctx.fillRect(x, y, this.spacing, height);
    
    for(let currentY = y; currentY < height+y; currentY++){
      for(let i = x * this.spacing; i < (x + 1) * this.spacing; i++){
        this.writePixel(i, currentY, color);
      }
    }
  }

  adjustBrightness(color, amount) {
    return color.map((component, i) => {
        if (i < 3) { // Ne pas ajuster l'alpha
            return Math.max(0, Math.min(255, component + amount));
        } else {
            return component; // Laisser l'alpha inchangé
        }
    });
}

  render(player, map, raycaster){
    this.callToPixels = 0;
    this.drawnPixels = 0;

    // this.ctx.fillStyle = '#ff6600';
    // this.ctx.globalAlpha = 1;
    // this.ctx.fillRect(0, 0, this.width, this.height);
    
    let playerZ = Math.floor(player.z);
    for (let offset = 3; offset > 0; offset--) {
      if (map.wallGrids[playerZ - offset]) {
        this.renderColumn(raycaster, player, map, -offset);
      }
      if (map.wallGrids[playerZ + offset]) {
        this.renderColumn(raycaster, player, map, offset);
      }
    }
    this.renderColumn(raycaster, player, map);

    // for(let i = 0; i < this.resolution; i++){
    //   this.writeColumn(i, 0, this.height, COLORS.blue);
    // }
    //console.log("callToPixels", this.callToPixels, "drawnPixels", this.drawnPixels, "ratio", this.drawnPixels/this.callToPixels);
    this.ctx.putImageData(this.pixelsData, 0, 0);
    this.pixelsData = this.ctx.createImageData(this.width, this.height);
  }

  renderColumn(raycaster, player, map, offset = 0){
    for(let i = 0; i < this.resolution; i++){
      let cameraX = 2 * i / this.resolution - 1; //x-coordinate in camera space
      
      let rayResult = raycaster.cast(player, cameraX, map);
      this.drawRay(rayResult, i, player, offset);
    }
  }

  _drawWireframeColumn(x, top, height, distance, color, side){
    //console.log("drawWireframeColumn", x, top, height, distance, color, side);
    
    if(side === 1) color = this.adjustBrightness(color, -30);
    this.writeColumn(x, top, height, color);
    
  }

  drawRay(rayResult, x, player, zOffset){
    for(let i = rayResult.length-1; i >= 0; i--){
      //console.log("drawRay", rayResult[i], x, player);
      let hit = rayResult.read(i);
      if(hit.cellInfos === false || hit.distance === 0) continue;

      let height = this.height / Math.abs(hit.distance);
      let top = (((this.height+height) / 2) - height*hit.cellInfos.heightRatio)// + (height * -zOffset) + (height * player.zRest);
      
      //console.log("drawRay", x, top, height, hit.distance, hit.cellInfos.heightRatio, height*hit.cellInfos.heightRatio, hit.side);
      if(rayResult.has(i+1)){
        let backHit = rayResult.read(i+1);
        
        let backHeight = this.height / Math.abs(backHit.distance);
        let backTop = (((this.height+backHeight) / 2) - backHeight*hit.cellInfos.heightRatio)// + (backHeight * -zOffset) + (backHeight * player.zRest);
        
        if(backTop < top){
          this._drawWireframeColumn(x, backTop, top - backTop, backHit.distance, COLORS.green, 0);
        }
        
        // if(backTop + backHeight*hit.cellInfos.heightRatio > top + height*hit.cellInfos.heightRatio){
        //   this._drawWireframeColumn(x, top + height*hit.cellInfos.heightRatio, backTop + backHeight*hit.cellInfos.heightRatio - top - height*hit.cellInfos.heightRatio, backHit.distance, COLORS.blue, 0);
        // }
      }

      this._drawWireframeColumn(x, top, height*hit.cellInfos.heightRatio, hit.distance, COLORS.red, hit.side);
    }
  }
}