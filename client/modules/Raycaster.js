import { GarbageCheater } from "./utils/GarbageCheater.js";

export class Raycaster {

  constructor(range) {
    
    this.range = range;

    this.stepArray = new GarbageCheater(() => {
      return {
        step: 0,
        distance: 0,
        cellInfos: null,
        offset: 0,
        side: 0,
        z: 0
      }}, 100, 50);
  }

  cast(player, cameraX, map, zLevel = 0) {
    this.stepArray.reset();
    
    let rayDirX = player.dirX + player.planeX * cameraX;
    let rayDirY = player.dirY + player.planeY * cameraX;

    //which box of the map we're in
    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);

    //length of ray from current position to next x or y-side
    let sideDistX;
    let sideDistY;

     //length of ray from one x or y-side to next x or y-side
    let deltaDistX = (1 / Math.abs(rayDirX));
    let deltaDistY = (1 / Math.abs(rayDirY));

    //what direction to step in x or y-direction (either +1 or -1)
    let stepX;
    let stepY;

    let side; //was a NS or a EW wall hit?

    //calculate step and initial sideDist
    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (player.x - mapX) * deltaDistX;
    }else {
      stepX = 1;
      sideDistX = (mapX + 1 - player.x) * deltaDistX;
    }

    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (player.y - mapY) * deltaDistY;
    }else {
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
      }else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      //Check if ray has hit a wall
      if (registerBackWall || map.getWall(mapX, mapY, zLevel) > 0) {
        //console.log("here is a wall");
        let cellInfos = map.getCellProperties(map.getWall(mapX, mapY, zLevel)) || false;

        let perpWallDist;
        let wallX; //where exactly the wall was hit

        if(cellInfos && cellInfos.thinWall) {
          if (side == 1) {
            let wallYOffset = 0.5 * stepY;
            perpWallDist = (mapY - player.y + wallYOffset + (1 - stepY) / 2) / rayDirY;
            wallX = player.x + perpWallDist * rayDirX;
            wallX -= Math.floor(wallX);
            if (sideDistY - (deltaDistY/2) < sideDistX) { //If ray hits offset wall
              let stepInfos = this.stepArray.getCurrent();
              stepInfos.distance = perpWallDist;
              stepInfos.cellInfos = cellInfos;
              stepInfos.offset = wallX;
              stepInfos.side = side;

              step = cellInfos && cellInfos.stopView ? this.range : step;
              registerBackWall = false;
              continue;
            }else{
              registerBackWall = true;
              continue;
            }
          } else { //side == 0
            let wallXOffset = 0.5 * stepX;
            perpWallDist  = (mapX - player.x + wallXOffset + (1 - stepX) / 2) / rayDirX;
            wallX = player.y + perpWallDist * rayDirY;
            wallX -= Math.floor(wallX);
            if (sideDistX - (deltaDistX/2) < sideDistY) {
              let stepInfos = this.stepArray.getCurrent();
              stepInfos.distance = perpWallDist;
              stepInfos.cellInfos = cellInfos;
              stepInfos.offset = wallX;
              stepInfos.side = side;

              step = cellInfos && cellInfos.stopView ? this.range : step;
              
              registerBackWall = false;
              continue;
            }else{
              registerBackWall = true;
              continue;
            }
          }
        }
        
        registerBackWall = cellInfos ? true : false;
        if(side == 0) {
          perpWallDist = (sideDistX - deltaDistX);
          wallX = player.y + perpWallDist * rayDirY;
        }else {
          perpWallDist = (sideDistY - deltaDistY);
          wallX = player.x + perpWallDist * rayDirX;
        };
        
        wallX -= Math.floor(wallX);
        let stepInfos = this.stepArray.getCurrent();
        stepInfos.distance = perpWallDist;
        stepInfos.cellInfos = cellInfos;
        stepInfos.offset = wallX;
        stepInfos.side = side;

        step = cellInfos && cellInfos.stopView ? this.range : step;
      }
    }
    return this.stepArray;
  }

}