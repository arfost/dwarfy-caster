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

export class RendererWorker {
  constructor({resolution, width, height}) {

    // this.width = display.width = Math.floor(window.innerWidth*0.5);
    // this.height = display.height = Math.floor(window.innerHeight*0.5);

    this.width = width;
    this.height = height;

    this.textureSize = { width: 256, height: 256 };
    this.spriteSize = { width: 64, height: 64 };

    this.resolution = resolution;
    this.spacing = this.width / resolution;

    this.cameraX = []

    for (let i = 0; i < this.resolution; i++) {
      this.cameraX[i] = 2 * i / this.resolution - 1; //x-coordinate in camera space
    }

    this.zBuffer = new Array(this.resolution).fill(0);

  };

  render(player, map, raycaster) {
    this.renderInstruction = [];

    this.zBuffer = new Array(this.resolution).fill(99);
    
    const playerZ = Math.floor(player.z);

    this._renderColumn(raycaster, player, map, playerZ);
    this._drawSprites(player, map.placeables[playerZ], map, playerZ);

    //console.log("renderInstruction", this.renderInstruction.length);
    //this._filterRenderInstruction();
    return this.renderInstruction;
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

      if(hit.backDistance){
        
        const backCellHeight = this.height / hit.backDistance;
        const backCellTop = (((this.height + backCellHeight) / 2) - backCellHeight) + (backCellHeight * -zOffset) + (backCellHeight * zRest) + verticalAdjustement;
        
        if (zOffset >=0 && hit.ceiling) {
          this._drawTexturedColumn(x,  backCellTop, cellTop - backCellTop, hit.distance, hit.ceiling.floorTexture, hit.offset, 1, hit.ceilingTint);
        }

        if (zOffset<=0 && hit.cellInfos ) {
          //draw floor
          if (hit.cellInfos.floorTexture && (hit.floorOnly || !hit.cellInfos.stopView)) {
            this._drawTexturedColumn(x,  cellTop + cellHeight, (backCellTop + backCellHeight) - (cellTop + cellHeight), hit.distance, hit.cellInfos.floorTexture, hit.offset, 0, hit.floorTint);
          }

          //draw top face
          if (hit.cellInfos.heightRatio < 1) {
            const blockHeight = cellHeight * hit.cellInfos.heightRatio;
            const blockTop = cellTop + (cellHeight - blockHeight);
  
            const backBlockHeight = backCellHeight * hit.cellInfos.heightRatio;
            const backBlockTop = backCellTop + (backCellHeight - backBlockHeight);
  
            // this._drawWireframeColumn(x, backBlockTop, blockTop - backBlockTop, hit.distance, COLORS.gray, 0);
            this._drawTexturedColumn(x, backBlockTop, blockTop - backBlockTop, hit.distance, hit.cellInfos.floorTexture, hit.offset, 0, hit.wallTint);
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
          this._drawTexturedColumn(x, blockTop, blockHeight, hit.distance, hit.cellInfos.wallTexture, hit.offset, hit.side, hit.wallTint);
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
          this._drawTexturedColumn(x, blockTop, blockHeight, hit.thinDistance, hit.cellInfos.wallTexture, hit.thinOffset, hit.thinSide, hit.wallTint);
        }
      }
    }
  }

  _filterRenderInstruction(){
    const instructionLength = this.renderInstruction.length;
    
    this.renderInstruction = this.renderInstruction.filter(instruction => {
      //too small
      if(instruction[4] > -2 && instruction[4] < 2){
        return false;
      }
      //outside bounds
      if(instruction[3] < 0 && instruction[3]+instruction[4] < 0 || instruction[3] > this.height && instruction[3]+instruction[4] > this.height){
        return false;
      }
      return true;
    });
    //console.log("filtered", instructionLength - this.renderInstruction.length);
  };

  drawImage(image, texX, x, top, height, shade, tint){
    this.renderInstruction.push([image, texX, x, top, height, shade, tint]);
  }

  fillRect(x, top, height, shade, tint){
    this.renderInstruction.push([x, top, height, shade, tint]);
  }

  drawSprite(sprite, drawXStart, drawXEnd, clipStartX, drawStartY, drawWidth, spriteHeight){
    this.renderInstruction.push([sprite, drawXStart, drawXEnd, clipStartX, drawStartY, drawWidth, spriteHeight, 0]);
  }

  _drawTexturedColumn(x, top, height, distance, image, texOffset, side, tint) {
    // if(height > this.height*2 || top > this.height*2 || top < -this.height*2 || height < -this.height*2) {
    //   return;
    // }
    // if(height < 3 && height > -3) {
    //   return;
    // }
    // height = Math.floor(height);
    // top = Math.floor(top);
    //this.drawCallList.push({x, top, height, distance, imageName:image.name, texOffset, side, tint});
    const texX = Math.floor(texOffset * this.textureSize.width);
    
    // shading
    let shade = 0;
    if (side === 0) {
      shade = 0.3;
    }
    shade += Math.max(0, Math.min(1, (distance) / 10));

    this.drawImage(image, texX, x* this.spacing, top, height, shade, tint);

  }

  _drawWater(x, top, height, distance, side) {
    //console.log("drawWater", x, top, height, distance, side);

    //shading
    let shade = 0;
    if (side === 0) {
      shade = 0.3;
    }
    shade = Math.max(0, Math.min(1, distance / 10));

    this.fillRect(x * this.spacing, top, height, shade, `rgba(0,0,255,0.5)`);
  }

  _drawMagma(x, top, height, distance, side) {
    //console.log("drawWater", x, top, height, distance, side);

    //shading
    let shade = 0;
    if (side === 0) {
      shade = 0.3;
    }
    shade = Math.max(0, Math.min(1, distance / 10));
    
    this.fillRect(x * this.spacing, top, height, shade, `rgba(255,0,0,0.5)`);
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
          const placeableWidth = this.spriteSize.width;

          const scaleDelta = placeableWidth / spriteWidth;
          let drawXStart = Math.floor((clipStartX - drawStartX) * scaleDelta);
          if (drawXStart < 0) {
            drawXStart = 0;
          }
          const drawXEnd = Math.floor((clipEndX - clipStartX) * scaleDelta) + 1;
          if (drawXEnd > placeableWidth) {
            drawEndX = placeableWidth;
          }
          let drawWidth = clipEndX - clipStartX;
          if (drawWidth < 0) {
            drawWidth = 0;
          }
          this.drawSprite(placeableInfos.sprite, drawXStart, drawXEnd, clipStartX* this.spacing, drawStartY + verticalAdjustement, drawWidth*this.spacing, spriteHeight);
          // this.ctx.drawImage(placeableSprite.image, drawXStart, 0, Math.round(drawXEnd), placeableSprite.height, Math.round(clipStartX * this.spacing), Math.round(drawStartY + verticalAdjustement), Math.round(drawWidth * this.spacing), Math.round(spriteHeight));
        }
      }
    }//End of spriteList for loop
  }
}