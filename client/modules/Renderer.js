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
  white: [255, 255, 255, 0.5],
  black: [0, 0, 0, 0.5],
  red: [255, 0, 0, 0.5],
  green: [0, 255, 0, 0.5],
  blue: [0, 0, 255, 0.5],
  yellow: [255, 255, 0, 0.5],
  cyan: [0, 255, 255, 0.5],
  magenta: [255, 0, 255, 0.5],
  gray: [128, 128, 128, 0.5],
  darkGray: [64, 64, 64, 0.5],
  lightGray: [192, 192, 192, 0.5],
  orange: [255, 200, 0, 0.5],
}

export class Renderer {
  constructor(display, resolution) {

    this.display = display;
    this.ctx = display.getContext('2d');

    // this.width = display.width = Math.floor(window.innerWidth*0.5);
    // this.height = display.height = Math.floor(window.innerHeight*0.5);

    this.width = display.width = 640;
    this.height = display.height = 360;

    this.resolution = resolution;
    this.spacing = this.width / resolution;

    // Création du canvas virtuel
    this.virtualCanvas = document.createElement('canvas');
    this.virtualCanvas.width = this.width;
    this.virtualCanvas.height = this.height;
    this.virtualCtx = this.virtualCanvas.getContext('2d');

    this.cameraX = [];

    this.facingCell = { x: 0, y: 0 };

    for (let i = 0; i < this.resolution; i++) {
      this.cameraX[i] = 2 * i / this.resolution - 1; //x-coordinate in camera space
    }

    this.zBuffer = new Array(this.resolution).fill(0);

  };

  async initAssets(assetNames) {

    this.textures = {};

    await Promise.all(assetNames.textures.map(async (textureName) => {
      let texture = new Bitmap(`assets/textures/${textureName}.png`, 256, 256);
      this.textures[textureName] = texture;
      return texture.imageLoaded;
    }));

    this.sprites = {};

    await Promise.all(assetNames.sprites.map(async (spriteName) => {
      let sprite = new Bitmap(`assets/sprites/${spriteName}.png`, 64, 64);
      this.sprites[spriteName] = sprite;
      return sprite.imageLoaded;
    }));
  }

  render(player, map, raycaster) {
    //this.drawCallList = [];
    //this.droppedCallList = [];
    this.zBuffer = new Array(this.resolution).fill(99);

    // Effacer le canvas virtuel
    this.virtualCtx.fillStyle = '#000';
    this.virtualCtx.fillRect(0, 0, this.width, this.height);


    const playerZ = Math.floor(player.z);

    this._updateFacingCell(player);

    this._renderColumn(raycaster, player, map, playerZ);
    this._drawSprites(player, map.placeables[playerZ], map, playerZ);
    //console.log("drawCallList", this.drawCallList);

    this.ctx.drawImage(this.virtualCanvas, 0, 0);
  }

  _updateFacingCell(player) {
    const celluleX = Math.floor(player.x - player.dirX);
    const celluleY = Math.floor(player.y - player.dirY);

    // update facing cell
    this.facingCell.x = celluleX;
    this.facingCell.y = celluleY;
  }

  _renderColumn(raycaster, player, map, layerZ) {
    for (let i = 0; i < this.resolution; i++) {
       //x-coordinate in camera space
      //let layerZ = Math.floor(player.z) + offset;
      const rayResult = raycaster.cast(player, this.cameraX[i], map, layerZ);
      this._drawRay(rayResult, i, player, layerZ);
    }
  }

  _drawRay(rayResult, x, player, playerZ) {
    if (rayResult.length === 0) return;
   
    for (let i = rayResult.length - 1; i >= 0; i--) {
    // for (let i = 0; i <= rayResult.length - 1; i++) {
      //console.log("drawRay", rayResult[i], x, player);
      const hit = rayResult.read(i);
      if(hit.distance === 0) continue;

      const zOffset = hit.zLevel - playerZ;
      const zRest = player.zRest;

      const verticalAdjustement = this.height * Math.tan(player.upDirection);

      const cellHeight = this.height / hit.distance;
      const cellTop = (((this.height + cellHeight) / 2) - cellHeight) + (cellHeight * -zOffset) + (cellHeight * zRest) + verticalAdjustement;

      const isFacingCell = this.facingCell.x === hit.x && this.facingCell.y === hit.y;

      if(hit.backDistance){
        
        const backCellHeight = this.height / hit.backDistance;
        const backCellTop = (((this.height + backCellHeight) / 2) - backCellHeight) + (backCellHeight * -zOffset) + (backCellHeight * zRest) + verticalAdjustement;
        
        if (zOffset >=0 && hit.ceiling) {
          this._drawTexturedColumn(x,  backCellTop, cellTop - backCellTop, hit.distance, this.textures[hit.ceiling.floorTexture], hit.offset, 1, hit.ceilingAdditionnalInfos ? hit.ceilingAdditionnalInfos.tint : false, isFacingCell);
        }

        if (zOffset<=0 && hit.cellInfos ) {
          //draw floor
          if (hit.cellInfos.floorTexture && (hit.floorOnly || !hit.cellInfos.stopView)) {
            this._drawTexturedColumn(x,  cellTop + cellHeight, (backCellTop + backCellHeight) - (cellTop + cellHeight), hit.distance, this.textures[hit.cellInfos.floorTexture], hit.offset, 0, hit.cellAdditionnalInfos ? hit.cellAdditionnalInfos.tint : false, isFacingCell);
          }

          //draw top face
          if (hit.cellInfos.heightRatio < 1) {
            const blockHeight = cellHeight * hit.cellInfos.heightRatio;
            const blockTop = cellTop + (cellHeight - blockHeight);
  
            const backBlockHeight = backCellHeight * hit.cellInfos.heightRatio;
            const backBlockTop = backCellTop + (backCellHeight - backBlockHeight);
  
            // this._drawWireframeColumn(x, backBlockTop, blockTop - backBlockTop, hit.distance, COLORS.gray, 0);
            this._drawTexturedColumn(x, backBlockTop, blockTop - backBlockTop, hit.distance, this.textures[hit.cellInfos.floorTexture], hit.offset, 0, hit.cellAdditionnalInfos ? hit.cellAdditionnalInfos.tint : false, isFacingCell);
          }
        }
        
        if(zOffset <= 0){
          //water top face
          
          if(hit.water){
            const blockHeight = cellHeight * (0.12*hit.water);
            const blockTop = cellTop + (cellHeight - blockHeight);
  
            const backBlockHeight = backCellHeight * (0.12*hit.water);
            const backBlockTop = backCellTop + (backCellHeight - backBlockHeight);
            this._drawWater(x, backBlockTop, blockTop - backBlockTop, hit.distance, hit.side);
          }
          if(hit.magma){
            const blockHeight = cellHeight * (0.12*hit.magma);
            const blockTop = cellTop + (cellHeight - blockHeight);
  
            const backBlockHeight = backCellHeight * (0.12*hit.magma);
            const backBlockTop = backCellTop + (backCellHeight - backBlockHeight);
            this._drawMagma(x, backBlockTop, blockTop - backBlockTop, hit.distance, hit.side);
          }
        }
      }
      
      if (hit.cellInfos) {
        //draw normal wall
        if (hit.cellInfos.wallTexture && !hit.cellInfos.thinWall && !hit.floorOnly) {
          if(zOffset === 0){
            this.zBuffer[x] = hit.distance;
          }
          const blockHeight = cellHeight * hit.cellInfos.heightRatio;
          const blockTop = cellTop + (cellHeight - blockHeight);
          this._drawTexturedColumn(x, blockTop, blockHeight, hit.distance, this.textures[hit.cellInfos.wallTexture], hit.offset, hit.side, hit.cellAdditionnalInfos ? hit.cellAdditionnalInfos.tint : false, isFacingCell);
        }
        if(zOffset >= 0){
          //liquide front face
          if(hit.water){
            const blockHeight = cellHeight * (0.12*hit.water);
            const blockTop = cellTop + (cellHeight - blockHeight);
            this._drawWater(x, blockTop, blockHeight, hit.distance, hit.side);
          }
          if(hit.magma){
            const blockHeight = cellHeight * (0.12*hit.magma);
            const blockTop = cellTop + (cellHeight - blockHeight);
            this._drawMagma(x, blockTop, blockHeight, hit.distance, hit.side);
          }
        }
        //draw thin wall
        if (hit.thinDistance && hit.cellInfos.wallTexture) {
          if(zOffset === 0){
            this.zBuffer[x] = hit.thinDistance;
          }
          const cellThinHeight = this.height / hit.thinDistance;
          const cellThinTop = (((this.height + cellThinHeight) / 2) - cellThinHeight) + (cellThinHeight * -zOffset) + (cellThinHeight * zRest) + verticalAdjustement;
          const blockHeight = cellThinHeight * hit.cellInfos.heightRatio;
          const blockTop = cellThinTop + (cellThinHeight - blockHeight);
          this._drawTexturedColumn(x, blockTop, blockHeight, hit.thinDistance, this.textures[hit.cellInfos.wallTexture], hit.thinOffset, hit.thinSide, hit.cellAdditionnalInfos ? hit.cellAdditionnalInfos.tint : false, isFacingCell);
        }
      }
    }
  }

  _drawTexturedColumn(x, top, height, distance, image, texOffset, side, tint, isFacingCell) {
    // if(height > this.height*2 || top > this.height*2 || top < -this.height*2 || height < -this.height*2) {
    //   return;
    // }
    // if(height < 3 && height > -3) {
    //   return;
    // }
    // height = Math.floor(height);
    // top = Math.floor(top);
    //this.drawCallList.push({x, top, height, distance, imageName:image.name, texOffset, side, tint});
    const texX = Math.floor(texOffset * image.width);

    this.virtualCtx.drawImage(image.image, texX, 0, 1, image.height, x * this.spacing, top, this.spacing, height);

    //tinting
    if (tint) {
      this.virtualCtx.fillStyle = `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, 0.3)`;
      this.virtualCtx.fillRect(x * this.spacing, top, this.spacing, height);
    }
    

    // shading
    let shade = 0;
    if (side === 0) {
      shade = 0.3;
    }
    shade += Math.max(0, Math.min(1, (distance) / 10));
    this.virtualCtx.fillStyle = `rgba(0,0,0,${shade})`;
    this.virtualCtx.fillRect(x * this.spacing, top, this.spacing, height);

    // facing cell
    if (isFacingCell) {
      this.virtualCtx.fillStyle = `rgba(0,255,0,0.3)`;
      this.virtualCtx.fillRect(x * this.spacing, top, this.spacing, height);
    }

  }

  _drawWater(x, top, height, distance, side) {
    //console.log("drawWater", x, top, height, distance, side);
    this.virtualCtx.fillStyle = `rgba(0, 0, 255, 0.5)`;
    this.virtualCtx.fillRect(x * this.spacing, top, this.spacing, height);

    //shading
    let shade = 0;
    if (side === 0) {
      shade = 0.3;
    }
    shade = Math.max(0, Math.min(1, distance / 10));
    this.virtualCtx.fillStyle = `rgba(0,0,0,${shade})`;
    this.virtualCtx.fillRect(x * this.spacing, top, this.spacing, height);
  }

  _drawMagma(x, top, height, distance, side) {
    //console.log("drawWater", x, top, height, distance, side);
    this.virtualCtx.fillStyle = `rgba(255, 0, 0, 0.5)`;
    this.virtualCtx.fillRect(x * this.spacing, top, this.spacing, height);

    //shading
    let shade = 0;
    if (side === 0) {
      shade = 0.3;
    }
    shade = Math.max(0, Math.min(1, distance / 10));
    this.virtualCtx.fillStyle = `rgba(0,0,0,${shade})`;
    this.virtualCtx.fillRect(x * this.spacing, top, this.spacing, height);
  }

  _drawWireframeColumn(x, top, height, distance, color, side) {
    //console.log("drawWireframeColumn", x, top, height, distance, color, side);

    this.virtualCtx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    this.virtualCtx.fillRect(x * this.spacing, top, this.spacing, height);

    //shading
    let shade = 0;
    if (side === 0) {
      shade = 0.3;
    }
    shade = Math.max(0, Math.min(1, distance / 10));
    this.virtualCtx.fillStyle = `rgba(0,0,0,${shade})`;
    this.virtualCtx.fillRect(x * this.spacing, top, this.spacing, height);
  }

  _drawSprites(player, placeables, map) {
    
    const verticalAdjustement = this.height * Math.tan(player.upDirection);
    const placeableOrders = [];
    const spriteDistance = [];
    //SPRITE CASTING
    for (let i = 0; i < placeables.length; i++) { //Calculate sprite distances and reset order
      placeableOrders[i] = i;
      spriteDistance[i] = ((player.x - placeables[i].x) * (player.x - placeables[i].x)) + ((player.y - placeables[i].y) * (player.y - placeables[i].y));
    }
    combSort(placeableOrders, spriteDistance, placeables.length); //Sort placeables by distance from the camera

    for (let i = 0; i < placeables.length; i++) {
      
      const spriteX = placeables[placeableOrders[i]].x - player.x;
      const spriteY = placeables[placeableOrders[i]].y - player.y;
      
      // if((spriteX > 0 && spriteX < 1 || spriteY > 0 && spriteY < 1) || (spriteX < 0 && spriteX > -1 || spriteY < 0 && spriteY > -1)){
      //   continue;
      // }

      const invDet = 1.0 / (player.planeX * -player.dirY + player.dirX * player.planeY);
      const transformX = invDet * (-player.dirY * spriteX + player.dirX * spriteY);
      const transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY);

      if (transformY > 0 && transformY < 10) { //No need for the rest if the sprite is behind the player
        const spriteHeight = Math.abs(this.height*0.75 / transformY);
        const drawStartY = (-spriteHeight / 4 + this.height/2) + (player.zRest * (spriteHeight/2)*2);

        const spriteScreenX = (this.resolution / 2) * (1 + transformX / transformY);
        const spriteWidth = Math.abs((this.resolution / 2) / transformY);
        let drawStartX = Math.floor(spriteScreenX - spriteWidth / 2);
        let drawEndX = Math.floor(drawStartX + spriteWidth);

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

        if (clipStartX != clipEndX && clipStartX < this.resolution && clipEndX > 0) { //Make sure the sprite is not fully obstructed or off screen
          
          const placeableInfos = map.getPlaceableProperties(placeables[placeableOrders[i]].type);
          const placeableSprite = this.sprites[placeableInfos.sprite];

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
          this.virtualCtx.drawImage(placeableSprite.image, drawXStart, 0, Math.round(drawXEnd), placeableSprite.height, Math.round(clipStartX * this.spacing), Math.round(drawStartY + verticalAdjustement), Math.round(drawWidth * this.spacing), Math.round(spriteHeight));
        }
      }
    }//End of spriteList for loop
  }
}