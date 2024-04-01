import { Bitmap } from "./Bitmap.js";

const randomTint = () => Math.floor(Math.random() * 256);

function combSort(order, dist, amount) {
  let gap = amount;
  let swapped = false;
  while (gap > 1 || swapped) {
    gap = Math.floor((gap * 10) / 13);
    if (gap == 9 || gap == 10) {
      gap = 11;
    }
    if (gap < 1) {
      gap = 1;
    }
    swapped = false;
    for (let i = 0; i < amount - gap; i++) {
      const j = i + gap;
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
  red: [255, 0, 0, 128],
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
  "branch_default": "assets/textures/branch_default.png",
  "door_default": "assets/textures/door_default.png",
  "feuillage_default": "assets/textures/feuillage_default.png",
  "floor_default": "assets/textures/floor_default.png",
  "fortification_default": "assets/textures/fortification_default.png",
  "slope_construction": "assets/textures/slope_construction.png",
  "slope_smooth_stone": "assets/textures/slope_smooth_stone.png",
  "slope_soil": "assets/textures/slope_soil.png",
  "slope_stone_rough": "assets/textures/slope_stone_rough.png",
  "slope_wood": "assets/textures/slope_wood.png",
  "stairs_construction": "assets/textures/stairs_construction.png",
  "stairs_smooth_stone": "assets/textures/stairs_smooth_stone.png",
  "stairs_soil": "assets/textures/stairs_soil.png",
  "stairs_stone_rough": "assets/textures/stairs_stone_rough.png",
  "stairs_wood": "assets/textures/stairs_wood.png",
  "wall_construction": "assets/textures/wall_construction.png",
  "wall_default": "assets/textures/wall_default.png",
  "wall_smooth_stone": "assets/textures/wall_smooth_stone.png",
  "wall_soil": "assets/textures/wall_soil.png",
  "wall_stone_rough": "assets/textures/wall_stone_rough.png",
  "wall_wood": "assets/textures/wall_wood.png",
  "wallbar_default": "assets/textures/wallbar_default.png",
}

const sprites = {
  "sprite_altar": "assets/sprites/sprite_altar.png",
  "sprite_bed": "assets/sprites/sprite_bed.png",
  "sprite_cabinet": "assets/sprites/sprite_cabinet.png",
  "sprite_chair": "assets/sprites/sprite_chair.png",
  "sprite_coffer": "assets/sprites/sprite_coffer.png",
  "sprite_statue": "assets/sprites/sprite_statue.png",
  "sprite_table": "assets/sprites/sprite_table.png",
  "sprite_stairs": "assets/sprites/sprite_chair.png",
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
    for (let key in this.sprites) {
      await this.sprites[key].imageLoaded;
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

    this.ctx.fillStyle = '#000';
    this.ctx.globalAlpha = 1;
    this.ctx.fillRect(0, 0, this.width, this.height);

    let playerZ = Math.floor(player.z);
    // for (let offset = 1; offset > 0; offset--) {
    //   if (map.wallGrids[playerZ - offset]) {
    //     this.renderColumn(raycaster, player, map, -offset);
    //   }
    //   if (map.wallGrids[playerZ + offset]) {
    //     this.renderColumn(raycaster, player, map, offset);
    //   }
    // }
    this.renderColumn(raycaster, player, map);
    this.drawSprites(player, map.placeables[playerZ], map);
  }

  renderColumn(raycaster, player, map, offset = 0) {
    for (let i = 0; i < this.resolution; i++) {
      let cameraX = 2 * i / this.resolution - 1; //x-coordinate in camera space
      let layerZ = Math.floor(player.z) + offset;
      let rayResult = raycaster.cast(player, cameraX, map, layerZ);
      this.drawRay(rayResult, i, player, offset);
    }
  }

  _drawTexturedColumn(x, top, height, distance, image, offset, side) {
    let texX = Math.abs(Math.floor(offset * image.width));

    this.ctx.drawImage(image.image, texX, 0, 1, image.height, x * this.spacing, top, this.spacing, height);

    //shading
    let shade = 0;
    if (side === 0) {
      shade = 0.3;
    }
    shade = Math.max(0, Math.min(1, distance / 10));
    this.ctx.fillStyle = `rgba(0,0,0,${shade})`;
    this.ctx.fillRect(x * this.spacing, top, this.spacing, height);

  }

  _drawWireframeColumn(x, top, height, distance, color, side) {
    //console.log("drawWireframeColumn", x, top, height, distance, color, side);

    this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    this.ctx.fillRect(x * this.spacing, top, this.spacing, height);

    //shading
    let shade = 0;
    if (side === 0) {
      shade = 0.3;
    }
    shade = Math.max(0, Math.min(1, distance / 10));
    this.ctx.fillStyle = `rgba(0,0,0,${shade})`;
    this.ctx.fillRect(x * this.spacing, top, this.spacing, height);
  }

  drawRay(rayResult, x, player, zOffset = 0) {
    if (rayResult.length === 0) return;
   
    for (let i = rayResult.length - 1; i >= 0; i--) {
      //console.log("drawRay", rayResult[i], x, player);
      const hit = rayResult.read(i);

      const cellHeight = this.height / Math.abs(hit.distance);
      const cellTop = (((this.height + cellHeight) / 2) - cellHeight) + (cellHeight * -zOffset) + (cellHeight * player.zRest);
// draw ceiling
      if (hit.ceiling && hit.backDistance) {
        const backCellHeight = this.height / Math.abs(hit.backDistance);
        const backCellTop = (((this.height + backCellHeight) / 2) - backCellHeight) + (backCellHeight * -zOffset) + (backCellHeight * player.zRest);
        this._drawWireframeColumn(x, backCellTop, cellTop - backCellTop, hit.distance, COLORS.gray, 0);
      }
      if (hit.cellInfos) {
        
        //draw wall
        if (hit.cellInfos.wallTexture && !hit.cellInfos.thinWall) {
          this.zBuffer[x] = hit.distance;
          const blockHeight = cellHeight * hit.cellInfos.heightRatio;
          const blockTop = cellTop + (cellHeight - blockHeight);
          this._drawTexturedColumn(x, blockTop, blockHeight, hit.distance, this.textures[hit.cellInfos.wallTexture], hit.offset, hit.side);
        }

        // draw floor
        if (hit.cellInfos.floorTexture && !(hit.cellInfos.wallTexture && !hit.cellInfos.thinWall)) {
          const backCellHeight = this.height / Math.abs(hit.backDistance);
          const backCellTop = (((this.height + backCellHeight) / 2) - backCellHeight) + (backCellHeight * -zOffset) + (backCellHeight * player.zRest);

          this._drawWireframeColumn(x, cellTop + cellHeight, (backCellTop + backCellHeight) - (cellTop + cellHeight), hit.distance, COLORS.gray, 0);
          // this._drawTexturedColumn(x,  cellTop + cellHeight, (backCellTop + backCellHeight) - (cellTop + cellHeight), hit.backDistance, this.textures[hit.cellInfos.floorTexture], hit.offset, 1);
        }

        // draw cell top
        if (hit.cellInfos.heightRatio < 1) {
          const blockHeight = cellHeight * hit.cellInfos.heightRatio;
          const blockTop = cellTop + (cellHeight - blockHeight);

          const backCellHeight = this.height / Math.abs(hit.backDistance);
          const backCellTop = (((this.height + backCellHeight) / 2) - backCellHeight) + (backCellHeight * -zOffset) + (backCellHeight * player.zRest);
          const backBlockHeight = backCellHeight * hit.cellInfos.heightRatio;
          const backBlockTop = backCellTop + (backCellHeight - backBlockHeight);

          this._drawWireframeColumn(x, backBlockTop, blockTop - backBlockTop, hit.distance, COLORS.gray, 0);
        }

        if (hit.thinDistance && hit.cellInfos.wallTexture) {
          this.zBuffer[x] = hit.thinDistance;
          const cellThinHeight = this.height / Math.abs(hit.thinDistance);
          const cellThinTop = (((this.height + cellThinHeight) / 2) - cellThinHeight) + (cellThinHeight * -zOffset) + (cellThinHeight * player.zRest);
          const blockHeight = cellThinHeight * hit.cellInfos.heightRatio;
          const blockTop = cellThinTop + (cellThinHeight - blockHeight);
          this._drawTexturedColumn(x, blockTop, blockHeight, hit.thinDistance, this.textures[hit.cellInfos.wallTexture], hit.thinOffset, hit.thinSide);
        }
      }
      
    }
  }

  drawSprites(player, placeables, map) {
    let placeableOrders = [];
    let spriteDistance = [];
    //SPRITE CASTING
    for (let i = 0; i < placeables.length; i++) { //Calculate sprite distances and reset order
      placeableOrders[i] = i;
      spriteDistance[i] = ((player.x - placeables[i].x) * (player.x - placeables[i].x)) + ((player.y - placeables[i].y) * (player.y - placeables[i].y));
    }
    combSort(placeableOrders, spriteDistance, placeables.length); //Sort placeables by distance from the camera

    for (let i = 0; i < placeables.length; i++) {
      
      const spriteX = placeables[placeableOrders[i]].x - player.x;
      const spriteY = placeables[placeableOrders[i]].y - player.y;

      const invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);
      const transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
      const transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY);

      if (transformY > 0) { //No need for the rest if the sprite is behind the player
        const spriteHeight = Math.abs(Math.floor(this.height / 2 / transformY));
        const drawStartY = (spriteHeight / 2) / 2 + Math.round(this.height / 2) + Math.round(player.zRest * this.height / transformY);

        const spriteScreenX = Math.floor(this.resolution / 2) * (1 + transformX / transformY);
        const spriteWidth = Math.abs(Math.floor(this.resolution / 2 / transformY));
        let drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX);
        let drawEndX = drawStartX + spriteWidth;

        let clipStartX = drawStartX;
        let clipEndX = drawEndX;

        if (drawStartX < -spriteWidth) {
          drawStartX = -spriteWidth;
        }
        if (drawEndX > this.resolution + spriteWidth) {
          drawEndX = this.resolution + spriteWidth;
        }

        for (let stripe = drawStartX; stripe <= drawEndX; stripe++) {
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
          const scaleDelta = placeableSprite.width / spriteWidth;
          let drawXStart = Math.floor((clipStartX - drawStartX) * scaleDelta);
          if (drawXStart < 0) {
            drawXStart = 0;
          }
          const drawXEnd = Math.floor((clipEndX - clipStartX) * scaleDelta) + 1;
          if (drawXEnd > placeableSprite.width) {
            drawEndX = placeableSprite.width;
          }
          let drawWidth = clipEndX - clipStartX;
          if (drawWidth < 0) {
            drawWidth = 0;
          }
          this.ctx.save();
          this.ctx.imageSmoothingEnabled = false;
          this.ctx.drawImage(placeableSprite.image, drawXStart * this.spacing, 0, drawXEnd, placeableSprite.height*placeableInfos.heightRatio, clipStartX * this.spacing, drawStartY, drawWidth * this.spacing, spriteHeight);
          this.ctx.restore();
        }
      }
    }//End of spriteList for loop
  }
}