import { GarbageCheater } from "./utils/GarbageCheater.js";

export class Raycaster {

  constructor(range) {

    this.range = range;
    this.zRange = 5;

    this.stepArray = new GarbageCheater(() => {
      return {
        step: 0,
        backDistance: 0,
        backOffset: 0,
        backSide: 0,
        thinDistance: 0,
        thinOffset: 0,
        thinSide: 0,
        distance: 0,
        offset: 0,
        side: 0,
        cellInfos: null,
        ceiling: null,
        floorOnly: false,
        zLevel: 0
      }
    }, 100, 50);
  }

  completeCast(player, cameraX, map, zLevel = 0) {
    
    this.stepArray.reset();
    return this._prepareCastValues(player, cameraX, map, zLevel);
  }

  cast(player, cameraX, map, zLevel = 0) {
    this.stepArray.reset();

    const rayDirX = player.dirX + player.planeX * cameraX;
    const rayDirY = player.dirY + player.planeY * cameraX;

    //which box of the map we're in
    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);

    //length of ray from current position to next x or y-side
    let sideDistX;
    let sideDistY;

    //length of ray from one x or y-side to next x or y-side
    const deltaDistX = (1 / Math.abs(rayDirX));
    const deltaDistY = (1 / Math.abs(rayDirY));

    //what direction to step in x or y-direction (either +1 or -1)
    let stepX;
    let stepY;

    let side; //was a NS or a EW wall hit?

    //calculate step and initial sideDist
    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (player.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1 - player.x) * deltaDistX;
    }

    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (player.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1 - player.y) * deltaDistY;
    }

    //perform DDA
    let step = 0;
    let registerBackWall = false;

    while (step <= this.range) {

      step++;
      //jump to next map square, either in x-direction, or in y-direction
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      if (registerBackWall) {
        this._backWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY);
        registerBackWall = false;
      }

      const stepInfos = this.stepArray.getCurrent();
      this._resetStepInfos(stepInfos);

      let perpWallDist;
      let wallX; //where exactly the wall was hit
      if (side == 0) {
        perpWallDist = (sideDistX - deltaDistX);
        wallX = player.y + perpWallDist * rayDirY;
      } else {
        perpWallDist = (sideDistY - deltaDistY);
        wallX = player.x + perpWallDist * rayDirX;
      };
      stepInfos.distance = perpWallDist;
      stepInfos.cellInfos = false;
      stepInfos.offset = wallX - Math.floor(wallX);;
      stepInfos.side = side;

      const mapCell = map.getWall(mapX, mapY, zLevel);
      //Check if ray has hit a wall
      if (mapCell > 0) {
        //console.log("here is a wall");
        stepInfos.cellInfos = map.getCellProperties(mapCell);

        if (stepInfos.cellInfos.thinWall) {
          this._thinWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY, stepX, stepY, mapX, mapY);
        } 

        if (stepInfos.cellInfos.floorTexture) {
          registerBackWall = true;
        }

        if(stepInfos.cellInfos.stopView) {
          break;
        }
        
      } 

      const mapCellZ = map.getWall(mapX, mapY, zLevel + 1);
      if (mapCellZ > 0 && this.stepArray.length > 0) {
        let cellInfos = map.getCellProperties(mapCellZ);
        stepInfos.ceiling = cellInfos;
        registerBackWall = true;
      }
    }
    return this.stepArray;
  }

  _prepareCastValues(player, cameraX, map, zLevel) {
    const rayDirX = player.dirX + player.planeX * cameraX;
    const rayDirY = player.dirY + player.planeY * cameraX;

    //which box of the map we're in
    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);

    //length of ray from current position to next x or y-side
    let sideDistX;
    let sideDistY;

    //length of ray from one x or y-side to next x or y-side
    const deltaDistX = (1 / Math.abs(rayDirX));
    const deltaDistY = (1 / Math.abs(rayDirY));

    //what direction to step in x or y-direction (either +1 or -1)
    let stepX;
    let stepY;

    let side; //was a NS or a EW wall hit?

    //calculate step and initial sideDist
    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (player.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1 - player.x) * deltaDistX;
    }

    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (player.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1 - player.y) * deltaDistY;
    }
    
    return this._startRay(player, mapX, mapY, sideDistX, sideDistY, deltaDistX, deltaDistY, stepX, stepY, side, rayDirX, rayDirY, zLevel, map, 0);
  }

  _startRay(player, mapX, mapY, sideDistX, sideDistY, deltaDistX, deltaDistY, stepX, stepY, side, rayDirX, rayDirY, zLevel, map, zOffset, step = 0) {
    let registerBackWall = -1;
    let alreadyLookedDown = false;
    let alreadyLookedUp = false;
    const delayedRay = [];
    while (step <= this.range) {

      step++;
      //jump to next map square, either in x-direction, or in y-direction
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      if (registerBackWall !== -1) {
        this._backWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY, registerBackWall);
        registerBackWall = -1;
      }

      const stepInfos = this.stepArray.getCurrent();
      this._resetStepInfos(stepInfos);

      let perpWallDist;
      let wallX; //where exactly the wall was hit
      if (side == 0) {
        perpWallDist = (sideDistX - deltaDistX);
        wallX = player.y + perpWallDist * rayDirY;
      } else {
        perpWallDist = (sideDistY - deltaDistY);
        wallX = player.x + perpWallDist * rayDirX;
      };
      stepInfos.distance = perpWallDist;
      stepInfos.cellInfos = false;
      stepInfos.offset = wallX - Math.floor(wallX);;
      stepInfos.side = side;
      stepInfos.zLevel = zLevel;

      const mapCell = map.getWall(mapX, mapY, zLevel);
      if(mapCell === -1){
        break;
      }
      //Check if ray has hit a wall
      if (mapCell > 0) {
        //console.log("here is a wall");
        stepInfos.cellInfos = map.getCellProperties(mapCell);

        if (stepInfos.cellInfos.thinWall) {
          this._thinWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY, stepX, stepY, mapX, mapY);
        } 

        if (stepInfos.cellInfos.floorTexture) {
          registerBackWall =  this.stepArray.length-1;;
        }

        if(stepInfos.cellInfos.stopView) {
          break;
        }
        
      }else{
        const mapCellZ = map.getWall(mapX, mapY, zLevel - 1);
        let cellInfos = map.getCellProperties(mapCellZ);
        if (mapCellZ > 0 && cellInfos.wallTexture && cellInfos.heightRatio === 1) {
          
          stepInfos.cellInfos = cellInfos;
          stepInfos.floorOnly = true;
          registerBackWall =  this.stepArray.length-1;
          alreadyLookedDown = false;
        }else{
          if(zOffset <=0 && zOffset> -this.zRange && !alreadyLookedDown){
            registerBackWall = this.stepArray.length-1;
            delayedRay.push([player, mapX, mapY, sideDistX, sideDistY, deltaDistX, deltaDistY, stepX, stepY, side, rayDirX, rayDirY, zLevel-1, map, zOffset-1, step]);
            // this._startRay(player, mapX, mapY, sideDistX, sideDistY, deltaDistX, deltaDistY, stepX, stepY, side, rayDirX, rayDirY, zLevel-1, map, this.range, step)
            alreadyLookedDown = true;
          }
        }
      }

      const mapCellZ = map.getWall(mapX, mapY, zLevel + 1);
      if (mapCellZ > 0) {
        let cellInfos = map.getCellProperties(mapCellZ);
        stepInfos.ceiling = cellInfos;
        registerBackWall = this.stepArray.length-1;
        alreadyLookedUp = false;
      }else{
        if(zOffset >=0 && zOffset < this.zRange && !alreadyLookedUp){
          registerBackWall = this.stepArray.length-1;
          delayedRay.push([player, mapX, mapY, sideDistX, sideDistY, deltaDistX, deltaDistY, stepX, stepY, side, rayDirX, rayDirY, zLevel+1, map, zOffset+1, step]);
          // this._startRay(player, mapX, mapY, sideDistX, sideDistY, deltaDistX, deltaDistY, stepX, stepY, side, rayDirX, rayDirY, zLevel+1, map, this.range, step)
          alreadyLookedUp = true;
        }
      }
    }

    delayedRay.forEach((params)=>{
      this._startRay(...params)
    });
    return this.stepArray;
  }

  _resetStepInfos(stepInfos) {
    stepInfos.step = 0;
    stepInfos.backDistance = 0;
    stepInfos.backOffset = 0;
    stepInfos.backSide = 0;
    stepInfos.thinDistance = 0;
    stepInfos.thinOffset = 0;
    stepInfos.thinSide = 0;
    stepInfos.distance = 0;
    stepInfos.offset = 0;
    stepInfos.side = 0;
    stepInfos.cellInfos = null;
    stepInfos.ceiling = null;
    stepInfos.floorOnly = false;
    stepInfos.zLevel = 0;
  }



  _backWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY, index) {
    if (this.stepArray.length === 0) return;
    let perpWallDist;
    let wallX; //where exactly the wall was hit
    if (side == 0) {
      perpWallDist = (sideDistX - deltaDistX);
      wallX = player.y + perpWallDist * rayDirY;
    } else {
      perpWallDist = (sideDistY - deltaDistY);
      wallX = player.x + perpWallDist * rayDirX;
    };
    let stepInfos = this.stepArray.read(index);
    stepInfos.backDistance = perpWallDist;
    stepInfos.backOffset = wallX - Math.floor(wallX);
    stepInfos.backSide = side;
  }


  _thinWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY, stepX, stepY, mapX, mapY) {
    let perpWallDist;
    let wallX; //where exactly the wall was hit
    if (side == 1) {
      let wallYOffset = 0.5 * stepY;
      perpWallDist = (mapY - player.y + wallYOffset + (1 - stepY) / 2) / rayDirY;
      wallX = player.x + perpWallDist * rayDirX;
      if (sideDistY - (deltaDistY / 2) < sideDistX) { //If ray hits offset wall
        let stepInfos = this.stepArray.read(this.stepArray.length - 1);
        stepInfos.thinDistance = perpWallDist;
        stepInfos.thinOffset = wallX - Math.floor(wallX);;
        stepInfos.thinSide = side;
      }
    } else { //side == 0
      let wallXOffset = 0.5 * stepX;
      perpWallDist = (mapX - player.x + wallXOffset + (1 - stepX) / 2) / rayDirX;
      wallX = player.y + perpWallDist * rayDirY;
      if (sideDistX - (deltaDistX / 2) < sideDistY) {
        let stepInfos = this.stepArray.read(this.stepArray.length - 1);
        stepInfos.thinDistance = perpWallDist;
        stepInfos.thinOffset = wallX - Math.floor(wallX);
        stepInfos.thinSide = side;
      }
    }
  }
}