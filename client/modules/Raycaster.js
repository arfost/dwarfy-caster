import { GarbageCheater } from "./utils/GarbageCheater.js";

export class Raycaster {

  constructor(range) {

    this.range = range;

    this.stepArray = new GarbageCheater(() => {
      return {
        step: 0,
        backDistance: 0,
        backOffset: 0,
        backSide: 0,
        distance: 0,
        offset: 0,
        side: 0,
        cellInfos: null,
        ceiling: null,
      }
    }, 100, 50);
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
      }
      const mapCell = map.getWall(mapX, mapY, zLevel);
      //Check if ray has hit a wall
      if (mapCell > 0) {
        //console.log("here is a wall");
        let cellInfos = map.getCellProperties(mapCell);

        if (cellInfos.thinWall) {
          registerBackWall = this._thinWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY, cellInfos, stepX, stepY, mapX, mapY);
        } else {
          registerBackWall = this._normalWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY, cellInfos);
        }

        if (!registerBackWall) {
          break;
        }
      } else if (mapCell === 0) {
        //console.log("no wall", mapX, mapY, zLevel, mapCell);
        let perpWallDist;
        let wallX; //where exactly the wall was hit
        if (side == 0) {
          perpWallDist = (sideDistX - deltaDistX);
          wallX = player.y + perpWallDist * rayDirY;
        } else {
          perpWallDist = (sideDistY - deltaDistY);
          wallX = player.x + perpWallDist * rayDirX;
        };
        const stepInfos = this.stepArray.getCurrent();
        stepInfos.distance = perpWallDist;
        stepInfos.cellInfos = false;
        stepInfos.offset = wallX - Math.floor(wallX);;
        stepInfos.side = side;
      }

      const mapCellZ = map.getWall(mapX, mapY, zLevel + 1);
      if (mapCellZ > 0 && this.stepArray.length > 0) {
        let cellInfos = map.getCellProperties(mapCellZ);
        let stepInfos = this.stepArray.read(this.stepArray.length - 1);
        stepInfos.ceiling = cellInfos;
      }
    }
    return this.stepArray;
  }



  _backWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY) {
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
    let stepInfos = this.stepArray.read(this.stepArray.length - 1);
    stepInfos.backDistance = perpWallDist;
    stepInfos.backOffset = wallX - Math.floor(wallX);
    stepInfos.backSide = side;
  }


  _thinWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY, cellInfos, stepX, stepY, mapX, mapY) {
    let perpWallDist;
    let wallX; //where exactly the wall was hit
    if (side == 1) {
      let wallYOffset = 0.5 * stepY;
      perpWallDist = (mapY - player.y + wallYOffset + (1 - stepY) / 2) / rayDirY;
      wallX = player.x + perpWallDist * rayDirX;
      if (sideDistY - (deltaDistY / 2) < sideDistX) { //If ray hits offset wall
        let stepInfos = this.stepArray.getCurrent();
        stepInfos.distance = perpWallDist;
        stepInfos.cellInfos = cellInfos;
        stepInfos.offset = wallX - Math.floor(wallX);;
        stepInfos.side = side;

        stepInfos.backDistance = 0;

        return !(!!cellInfos.stopView);
      } else {
        return true;
      }
    } else { //side == 0
      let wallXOffset = 0.5 * stepX;
      perpWallDist = (mapX - player.x + wallXOffset + (1 - stepX) / 2) / rayDirX;
      wallX = player.y + perpWallDist * rayDirY;
      if (sideDistX - (deltaDistX / 2) < sideDistY) {
        let stepInfos = this.stepArray.getCurrent();
        stepInfos.distance = perpWallDist;
        stepInfos.cellInfos = cellInfos;
        stepInfos.offset = wallX - Math.floor(wallX);
        stepInfos.side = side;

        stepInfos.backDistance = 0;

        return !(!!cellInfos.stopView);
      } else {
        return true;
      }
    }
  }

  _normalWall(side, sideDistX, sideDistY, deltaDistX, deltaDistY, player, rayDirX, rayDirY, cellInfos) {
    let perpWallDist;
    let wallX; //where exactly the wall was hit
    if (side == 0) {
      perpWallDist = (sideDistX - deltaDistX);
      wallX = player.y + perpWallDist * rayDirY;
    } else {
      perpWallDist = (sideDistY - deltaDistY);
      wallX = player.x + perpWallDist * rayDirX;
    };

    let stepInfos = this.stepArray.getCurrent();
    stepInfos.distance = perpWallDist;
    stepInfos.cellInfos = cellInfos;
    stepInfos.offset = wallX - Math.floor(wallX);
    stepInfos.side = side;
    stepInfos.backDistance = 0;
    return !(!!cellInfos.stopView);
  }

}