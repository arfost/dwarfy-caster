class ServerMap {

  constructor(mapLoader) {
    this._ready = false;
    this.preparedChunks = {};
    this.preparedPlaceables = {};


    this.invalidatedZlevels = [];

    this.currentTick = 1;
    this.CHUNK_SIZE = 16;

    this.mapLoader = mapLoader;

  }

  async initMap() {
    this.mapInfos = await this.mapLoader.initMap(this);
    this.map = this.mapLoader.map;
    this.floorTint = this.mapLoader.floorTint;
    this.wallTint = this.mapLoader.wallTint;
    this.rtLayers = this.mapLoader.rtLayers;
    this.placeables = this.mapLoader.placeables;
    this.infos = this.mapLoader._infos;
    this._ready = true;
    console.log("Map loaded");
  }

  getPlaceableModel(){
    return {};
  }

  invalidateZlevel(zLevel) {
    if (!this.invalidatedZlevels.includes(zLevel)) {
      this.invalidatedZlevels.push(zLevel);
    }
  }

  update(players, delta) {
    //update placeables
    this.mapLoader.update(delta)
    for (let player of players) {
      this.mapLoader.playerUpdate(player, delta);
    }
    
    for(let zLevel of this.invalidatedZlevels) {
      this.preparedPlaceables[zLevel] = false;
    }
    this.invalidatedZlevels = [];
    this.flushModifiedCells();
  }

  prepareZlevel(zLevel) {
    let placeables = [];
    for(let placeable of this.placeables) {
      if(placeable.z === zLevel) {
        placeables.push(placeable);
      }
    }
    this.preparedPlaceables[zLevel] = placeables;
  }

  getPlaceablesForLevel(level) {
    if(!this.preparedPlaceables[level]) {
      this.prepareZlevel(level);
    }
    return this.preparedPlaceables[level];
  };

  ready() {
    return this._ready;
  }

  getRTLayerInfosForPosition(layer, x, y, z) {
    const datas = [];
    //get one chunk size around the player
    for (let k = 0; k < this.CHUNK_SIZE; k++) {
      datas[k] = [];
      for (let j = 0; j < this.CHUNK_SIZE; j++) {
        for (let i = 0; i < this.CHUNK_SIZE; i++) {
          if(x + i < 0 || x + i >= this.mapInfos.size.x || y + j < 0 || y + j >= this.mapInfos.size.y || z + k < 0 || z + k >= this.mapInfos.size.z) {
            datas[k][j * this.CHUNK_SIZE + i] = 0;
          }else{
            datas[k][j * this.CHUNK_SIZE + i] = layer[z + k][(y + j) * this.mapInfos.size.x + (x + i)];
          }
        }
      }
    }
    return datas;
  }

  prepareChunk(chunkKey) {
    console.log("===============> preparing chunk", chunkKey);
    let [x, y, z] = chunkKey.split(',').map(Number);
    let chunk = {
      chunkX: x,
      chunkY: y,
      chunkZ: z,
      version: Date.now(),
    };
    chunk.datas = new Array(this.CHUNK_SIZE).fill(0).map(() => []);
    for (let i = 0; i < this.CHUNK_SIZE; i++) {
      for (let j = 0; j < this.CHUNK_SIZE; j++) {
        for (let k = 0; k < this.CHUNK_SIZE; k++) {
          //prepare indexes for the chunk
          const cellX = x * this.CHUNK_SIZE + i;
          const cellY = y * this.CHUNK_SIZE + j;
          const cellZ = z * this.CHUNK_SIZE + k;

          if(cellX < 0 || cellX >= this.mapInfos.size.x || cellY < 0 || cellY >= this.mapInfos.size.y || cellZ < 0 || cellZ >= this.mapInfos.size.z) {
            console.log("out of bounds", cellX, cellY, cellZ, this.mapInfos.size.x, this.mapInfos.size.y, this.mapInfos.size.z, chunkKey);
          }else{
            //block format : [cell, floortint, walltint]
            chunk.datas[k][j * this.CHUNK_SIZE + i] = [
              this.map[z * this.CHUNK_SIZE + k][(y * this.CHUNK_SIZE + j) * this.mapInfos.size.x + (x * this.CHUNK_SIZE + i)],
              this.floorTint[z * this.CHUNK_SIZE + k][(y * this.CHUNK_SIZE + j) * this.mapInfos.size.x + (x * this.CHUNK_SIZE + i)],
              this.wallTint[z * this.CHUNK_SIZE + k][(y * this.CHUNK_SIZE + j) * this.mapInfos.size.x + (x * this.CHUNK_SIZE + i)]
            ];
          }
        }
      }
    }
    this.preparedChunks[chunkKey] = chunk;
  }

  keyFromPosition(x, y, z) {
    return `${Math.floor(x / this.CHUNK_SIZE)},${Math.floor(y / this.CHUNK_SIZE)},${Math.floor(z / this.CHUNK_SIZE)}`;
  }

  modifiedCellsList = [];
  notifyCellModification(x, y, z) {
    this.modifiedCellsList.push([x, y, z]);
  }

  flushModifiedCells() {
    this.modifiedCellsList.reduce((doneChunk, [x, y, z]) => {
      const chunkKey = this.keyFromPosition(x, y, z);
      if (!doneChunk[chunkKey]) {
        this.removePreparedChunk(chunkKey);
        doneChunk[chunkKey] = true;
      }
      return doneChunk;
    }, {});
    this.modifiedCellsList = [];
  }

  get preparationInterface() {
    return {
      notifyCellModification: this.notifyCellModification.bind(this),
      notifyZlevelModification: this.invalidateZlevel.bind(this),
    }
  }

  getChunkKeysForPlayerPosition(x, y, z, size = 1) {
    //get the chunk the player is in
    let chunkX = Math.floor(x / this.CHUNK_SIZE);
    let chunkY = Math.floor(y / this.CHUNK_SIZE);
    let chunkZ = Math.floor(z / this.CHUNK_SIZE);

    let chunks = [];
    //get the chunks around the player
    for (let i = -size; i <= size; i++) {
      for (let j = -size; j <= size; j++) {
        for (let k = -size; k <= size; k++) {
          if(k + chunkZ < 0 || k + chunkZ >= this.mapInfos.size.z / this.CHUNK_SIZE) {
            continue;
          }
          const chunkKey = `${chunkX + i},${chunkY + j},${chunkZ + k}`;
          chunks.push(`${chunkKey}:${this.preparedChunks[chunkKey] ? this.preparedChunks[chunkKey].version : 0}`);
        }
      }
    }
    return chunks;
  }

  getChunksForChunkKeys(keys) {
    return keys.map(this.getChunkForChunkKey);
  }

  getChunkForChunkKey(key) {
    //remove version from key
    key = key.split(':')[0];
    if (!this.preparedChunks[key]) {
      this.prepareChunk(key);
    }
    return this.preparedChunks[key];
  }

  getInfos(id){
    return this.infos.get(id);
  }

  removePreparedChunk(key) {
    this.preparedChunks[key] = false;
  }
}

module.exports = ServerMap;
