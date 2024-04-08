export class GameMap {

  constructor(mapLoader, startCoord) {
    this.mapLoader = mapLoader;
    this.size = mapLoader.mapInfos.size;
    this.light = 3;

    const chunkCoord = this.playerCoordToMapCoord(startCoord);
    this.ready = this.mapLoader.loadChunk(chunkCoord.x-mapLoader.CHUNK_SIZE, chunkCoord.y-mapLoader.CHUNK_SIZE, chunkCoord.z-mapLoader.CHUNK_SIZE, mapLoader.CHUNK_SIZE*2+1);

    const chunkLength = mapLoader.BLOCK_SIZE * (mapLoader.CHUNK_SIZE);
    const chunkLengthZ = mapLoader.BLOCK_SIZE_Z * (mapLoader.CHUNK_SIZE);

    this.nextChunks = {
      xMin: startCoord.x - chunkLength/2,
      xMax: startCoord.x + chunkLength/2,
      yMin: startCoord.y - chunkLength/2,
      yMax: startCoord.y + chunkLength/2,
      zMin: startCoord.z - chunkLengthZ/2,
      zMax: startCoord.z + chunkLengthZ/2,
      chunkLength,
      chunkLengthZ
    }
    console.log("chunks init", this.nextChunks);

    this.cellProperties = mapLoader.definitions.cellDefinitions;
    this.placeableProperties = mapLoader.definitions.placeableDefinitions;
  }

  get placeables() {
    return this.mapLoader.placeables;
  }
  
  get wallAdditionnalInfos() {
    return this.mapLoader.additionnalInfos;
  }

  get wallGrids(){
    return this.mapLoader.map;
  }

  async teleportToCursor(player) {
    const cursor = await this.mapLoader.getCursorPosition();

    const chunkCoord = this.playerCoordToMapCoord(cursor);
    await this.mapLoader.loadChunk(chunkCoord.x-this.mapLoader.CHUNK_SIZE, chunkCoord.y-this.mapLoader.CHUNK_SIZE, chunkCoord.z-this.mapLoader.CHUNK_SIZE, this.mapLoader.CHUNK_SIZE*2+1);

    const chunkLength = this.mapLoader.BLOCK_SIZE * (this.mapLoader.CHUNK_SIZE);
    const chunkLengthZ = this.mapLoader.BLOCK_SIZE_Z * (this.mapLoader.CHUNK_SIZE);

    this.nextChunks = {
      xMin: cursor.x - chunkLength/2,
      xMax: cursor.x + chunkLength/2,
      yMin: cursor.y - chunkLength/2,
      yMax: cursor.y + chunkLength/2,
      zMin: cursor.z - chunkLengthZ/2,
      zMax: cursor.z + chunkLengthZ/2,
      chunkLength,
      chunkLengthZ
    }
    console.log("chunks init", this.nextChunks);

    player.x = cursor.x;
    player.y = cursor.y;
    player.z = cursor.z;
  }

  getCellProperties(type) {
    return this.cellProperties[type];
  }

  getPlaceableProperties(type) {
    return this.placeableProperties[type];
  }

  getWall(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return -1;
    return this.wallGrids[z][y * this.size.x + x];
  };

  getWallAdditionnalInfos(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return -1;
    return this.wallAdditionnalInfos.get(`${x},${y},${z}`);
  };

  playerCoordToMapCoord(player) {
    return {
      x: Math.floor(player.x / this.mapLoader.BLOCK_SIZE),
      y: Math.floor(player.y / this.mapLoader.BLOCK_SIZE),
      z: Math.floor(player.z / this.mapLoader.BLOCK_SIZE_Z)
    }
  }

  getNextChunks(direction, player) {
    const chunkCoord = this.playerCoordToMapCoord(player);
    switch (direction) {
      case "up":
        chunkCoord.z += this.mapLoader.CHUNK_SIZE*2;
        this.nextChunks.zMax += this.nextChunks.chunkLengthZ;
        break;
      case "down":
        chunkCoord.z -= this.mapLoader.CHUNK_SIZE*2;
        this.nextChunks.zMin -= this.nextChunks.chunkLengthZ;
        break;
      case "forward":
        chunkCoord.x += this.mapLoader.CHUNK_SIZE*2;
        this.nextChunks.xMax += this.nextChunks.chunkLength;
        break;
      case "backward":
        chunkCoord.x -= this.mapLoader.CHUNK_SIZE*2;
        this.nextChunks.xMin -= this.nextChunks.chunkLength;
        break;
      case "left":
        chunkCoord.y += this.mapLoader.CHUNK_SIZE*2;
        this.nextChunks.yMax += this.nextChunks.chunkLength;
        break;
      case "right":
        chunkCoord.y -= this.mapLoader.CHUNK_SIZE*2;
        this.nextChunks.yMin -= this.nextChunks.chunkLength;
        break;
    }
    this.mapLoader.loadChunk(chunkCoord.x-this.mapLoader.CHUNK_SIZE, chunkCoord.y-this.mapLoader.CHUNK_SIZE, chunkCoord.z-this.mapLoader.CHUNK_SIZE, this.mapLoader.CHUNK_SIZE*2+1);
    
  }

  update(seconds, player) {
    if(this.mapLoader.CHUNK_SIZE<1) return;
    if(player.y> this.nextChunks.yMax){
      this.getNextChunks("left", player);
    }
    if(player.y< this.nextChunks.yMin){
      this.getNextChunks("right", player);
    }
    if(player.x> this.nextChunks.xMax){
      this.getNextChunks("forward", player);
    }
    if(player.x< this.nextChunks.xMin){
      this.getNextChunks("backward", player);
    }
    if(player.z> this.nextChunks.zMax){
      this.getNextChunks("up", player);
    }
    if(player.z< this.nextChunks.zMin){
      this.getNextChunks("down", player);
    }
  }
}

