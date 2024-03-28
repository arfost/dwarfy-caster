import { Bitmap } from "./Bitmap.js";

function combSort(order, dist, amount) {
	var gap = amount;
	var swapped = false;
	while(gap > 1 || swapped) {
		gap = Math.floor((gap * 10) / 13);
		if (gap == 9 || gap == 10) {
			gap = 11;
		}
		if (gap < 1) {
			gap = 1;
		}
		swapped = false;
		for (var i=0; i<amount - gap; i++) {
			var j = i + gap;
			if (dist[i] < dist[j]) {
				[dist[i], dist[j]] = [dist[j], dist[i]]; //Swap distances
				[order[i], order[j]] = [order[j], order[i]]; //Swap sort order
				swapped = true;
			}
		}
	}
}

const COLORS = {
  white: [255, 255, 255, 255],
  black: [0, 0, 0, 255],
  red: [255, 0, 0, 255],
  green: [0, 255, 0, 128],
  blue: [0, 0, 255, 128],
  yellow: [255, 255, 0, 255],
  cyan: [0, 255, 255, 255],
  magenta: [255, 0, 255, 255],
  gray: [128, 128, 128, 255],
  darkGray: [64, 64, 64, 255],
  lightGray: [192, 192, 192, 255],
  orange: [255, 200, 0, 255],
}

const textures = {
  "wall_default": "assets/textures/wall_default.png",
  "wall_soil": "assets/textures/wall_soil.png",
  "floor_default": "assets/textures/floor_default.png",
  "sprite_door": "assets/textures/sprite_door.png",
}

const sprites = {
  "sprite_coffer": "assets/sprites/sprite_coffer.png",
}

export class Renderer {
  constructor(display, resolution) {

    this.display = display;
    this.ctx = display.getContext('2d');

    // this.width = display.width = Math.floor(window.innerWidth*0.5);
    // this.height = display.height = Math.floor(window.innerHeight*0.5);

    this.width = display.width = 640;
    this.height = display.height = 480;

    this.resolution = resolution;
    this.spacing = Math.floor(this.width / resolution);

    this.textures = {};
    for (let key in textures) {
      let texture = new Bitmap(textures[key], 256, 256);
      this.textures[key] = texture;
    }

    this.sprites = {};
    for (let key in sprites) {
      let sprite = new Bitmap(sprites[key], 64, 64);
      this.sprites[key] = sprite;
    }

    this.zBuffer = new Array(this.resolution).fill(0);

    // this.pixelsData = this.ctx.createImageData(this.width, this.height);

  };

  async initTextures() {
    for (let key in this.textures) {
      await this.textures[key].imageLoaded;
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

  render(player, map, raycaster) {
    this.callToPixels = 0;
    this.drawnPixels = 0;

    this.ctx.fillStyle = '#000';
    this.ctx.globalAlpha = 1;
    this.ctx.fillRect(0, 0, this.width, this.height);

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
    this.drawSprites(player, map.placeables[playerZ], map);
  }

  renderColumn(raycaster, player, map, offset = 0) {
    for (let i = 0; i < this.resolution; i++) {
      let cameraX = 2 * i / this.resolution - 1; //x-coordinate in camera space

      let rayResult = raycaster.cast(player, cameraX, map);
      this.drawRay(rayResult, i, player, offset);
    }
  }

  _drawTexturedColumn(x, top, height, distance, image, offset, side) {
    let texX = Math.abs(Math.floor(offset * image.width));

    // let pixels = image.bandes[texX][side];

    // //this.ctx.putImageData(pixels, x * this.spacing, Math.floor(top));

    // this.ctx.drawImage(pixels, x * this.spacing, top, this.spacing, height);
    
    this.ctx.drawImage(image.image, texX, 0, 1, image.height, x*this.spacing, top, this.spacing, height);
    if(side === 0){
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(x*this.spacing, top, this.spacing, height);
    }
      
  }

  _drawWireframeColumn(x, top, height, distance, color, side) {
    //console.log("drawWireframeColumn", x, top, height, distance, color, side);

    if (side === 1) color = this.adjustBrightness(color, -30);
    // this.writeColumn(x, top, height, color);

    this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    this.ctx.fillRect(x * this.spacing, top, this.spacing, height);

  }

  drawRay(rayResult, x, player, zOffset = 0) {
    if(zOffset === 0 && rayResult.length > 0){
      this.zBuffer[x] = rayResult.read(rayResult.length - 1).distance;
    }
    for (let i = rayResult.length - 1; i >= 0; i--) {
      //console.log("drawRay", rayResult[i], x, player);
      let hit = rayResult.read(i);
      if (hit.cellInfos === false || hit.distance === 0) continue;

      let height = this.height / Math.abs(hit.distance);
      let top = (((this.height + height) / 2) - height * hit.cellInfos.heightRatio) + (height * -zOffset) + (height * player.zRest);

      //console.log("drawRay", x, top, height, hit.distance, hit.cellInfos.heightRatio, height*hit.cellInfos.heightRatio, hit.side);
      if (rayResult.has(i + 1)) {
        let backHit = rayResult.read(i + 1);

        let backHeight = this.height / Math.abs(backHit.distance);
        let backTop = (((this.height + backHeight) / 2) - backHeight * hit.cellInfos.heightRatio) + (backHeight * -zOffset) + (backHeight * player.zRest);

        if (backTop < top) {
          // this._drawTexturedColumn(x, backTop, top - backTop, backHit.distance, this.textures[hit.cellInfos.texture], hit.offset, 0);
          this._drawWireframeColumn(x, backTop, top - backTop, backHit.distance, COLORS.gray, 0);
        }

        if (backTop + backHeight * hit.cellInfos.heightRatio > top + height * hit.cellInfos.heightRatio) {
          // this._drawTexturedColumn(x, top + height * hit.cellInfos.heightRatio, backTop + backHeight * hit.cellInfos.heightRatio - top - height * hit.cellInfos.heightRatio, backHit.distance, this.textures[hit.cellInfos.texture], hit.offset, 0);
          this._drawWireframeColumn(x, top + height*hit.cellInfos.heightRatio, backTop + backHeight*hit.cellInfos.heightRatio - top - height*hit.cellInfos.heightRatio, backHit.distance, COLORS.darkGray, 0);
        }
      }

      this._drawTexturedColumn(x, top, height * hit.cellInfos.heightRatio, hit.distance, this.textures[hit.cellInfos.texture], hit.offset, hit.side);
      // this._drawWireframeColumn(x, top, height*hit.cellInfos.heightRatio, hit.distance, COLORS.red, hit.side);
    }
  }

  drawSprites(player, placeables, map) {
    let placeableOrders = [];
    let spriteDistance = [];
    //SPRITE CASTING
    for (var i=0; i<placeables.length; i++) { //Calculate sprite distances and reset order
      placeableOrders[i] = i;
      spriteDistance[i] = ((player.x - placeables[i].x) * (player.x - placeables[i].x)) + ((player.y - placeables[i].y) * (player.y - placeables[i].y));
    }
    combSort(placeableOrders, spriteDistance, placeables.length); //Sort placeables by distance from the camera

    for (var i=0; i<placeables.length; i++) {
      var spriteX = placeables[placeableOrders[i]].x - player.x;
      var spriteY = placeables[placeableOrders[i]].y - player.y;
      
      var invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);
      var transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
      var transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY);
  
      if (transformY > 0) { //No need for the rest if the sprite is behind the player
  
        var spriteHeight = Math.abs(Math.floor(this.height/transformY));
        var drawStartY = -spriteHeight / 2 + Math.round(this.height / 2) + Math.round(player.zRest * this.height / transformY);
  
        var spriteScreenX = Math.floor(this.resolution/2) * (1 + transformX / transformY);
        var spriteWidth = Math.abs(Math.floor(this.height / transformY));
        var drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX);
        var drawEndX = drawStartX + spriteWidth;
        
        var clipStartX = drawStartX;
        var clipEndX = drawEndX;
  
        if (drawStartX < -spriteWidth) {
          drawStartX = -spriteWidth;
        }
        if (drawEndX > this.resolution + spriteWidth) {
          drawEndX = this.resolution + spriteWidth;
        }
  
        for (var stripe=drawStartX; stripe<=drawEndX; stripe++) {
          if (transformY > this.zBuffer[stripe]) {
            if (stripe - clipStartX <= 1) { //Detect leftmost obstruction
              clipStartX = stripe;
            } else {
              clipEndX = stripe; //Detect rightmost obstruction
              break;
            }
          }	
        }
        
        let placeableInfos = map.getPlaceableProperties(placeables[placeableOrders[i]].type);
        let placeableSprite = this.sprites[placeableInfos.sprite];

        if (clipStartX != clipEndX && clipStartX < this.resolution && clipEndX > 0) { //Make sure the sprite is not fully obstructed or off screen
          var scaleDelta = placeableSprite.width / spriteWidth;
          var drawXStart = Math.floor((clipStartX - drawStartX) * scaleDelta);
          if (drawXStart < 0) {
            drawXStart = 0;
          }
          var drawXEnd = Math.floor((clipEndX - clipStartX) * scaleDelta) + 1;
          if (drawXEnd > placeableSprite.width) {
            drawEndX = placeableSprite.width;
          }
          var drawWidth = clipEndX - clipStartX;
          if (drawWidth < 0) {
            drawWidth = 0;
          }
          this.ctx.save();
          this.ctx.imageSmoothingEnabled = false;
          this.ctx.drawImage(placeableSprite.image, drawXStart, 0, drawXEnd, placeableSprite.height, clipStartX, drawStartY, drawWidth, spriteHeight);
          this.ctx.restore();
        }
      }
    }//End of spriteList for loop
  }
}