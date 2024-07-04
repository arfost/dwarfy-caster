const { ObjectPool } = require("../utils/gcHelpers");

const placeableProperties = [
  "id",
  "x",
  "y",
  "z",
  "type",
  "tick"
];

class MapLoader {

  constructor(poolSize = 1000) {
    this._ready = false;
    this.preparedChunks = {};
    this.placeablePool = new ObjectPool(() => {
      return {
        id: 0,
        x: 0,
        y: 0,
        z: 0,
        type: 0,
        tick: false
      }
    }, poolSize, poolSize/2);

    this.invalidatedZlevels = [];
    this.placeableList = {};
    this.currentTick = 1;
  }

  invalidateZlevel(zLevel) {
    if (!this.invalidatedZlevels.includes(zLevel)) {
      this.invalidatedZlevels.push(zLevel);
    }
  }

  update(players, seconds) {
    //clean placeables with outdated tick
    for (let id in this.placeableList) {
      if (this.placeableList[id].tick && this.placeableList[id].tick !== this.currentTick) {
        this.invalidateZlevel(this.placeableList[id].z);
        this.placeableList[id].release(this.placeableList[id]);
        delete this.placeableList[id];
      }
    }
    this.currentTick++;
    for(let zLevel in this.invalidatedZlevels) {
      this.placeables[zLevel] = false;
    }
    this.invalidatedZlevels = [];
  }

  prepareZlevel(zLevel) {
    let placeables = [];
    for(let placeable in this.placeableList) {
      if(this.placeableList[placeable].z === zLevel) {
        placeables.push(this.placeableList[placeable]);
      }
    }
    this.placeables[zLevel] = placeables;
  }

  getPlaceablesForLevel(level) {
    if(!this.placeables[level]) {
      this.prepareZlevel(level);
    }
    return this.placeables[level];
  };

  ready() {
    return this._ready;
  }

  updatePlaceable(placeable) {
    if(!this.placeableList[placeable.id]) {
      this.placeableList[placeable.id] = placeable;
      this.invalidateZlevel(placeable.z);
    }else{
      const oldPlaceable = this.placeableList[placeable.id];
      if(oldPlaceable.z !== placeable.z) {
        this.invalidateZlevel(oldPlaceable.z);
        this.invalidateZlevel(placeable.z);
      }
      
      for(let prop of placeableProperties) {
        if(oldPlaceable[prop] !== placeable[prop]) {
          oldPlaceable[prop] = placeable[prop];
        }
      }
    }
  }

  getRTLayerInfosForPosition(layer, x, y, z) {
    const datas = [];
    //get one chunk size around the player
    for (let k = 0; k < this.CHUNK_SIZE; k++) {
      datas[k] = [];
      for (let j = 0; j < this.CHUNK_SIZE; j++) {
        for (let i = 0; i < this.CHUNK_SIZE; i++) {
          datas[k][j * this.CHUNK_SIZE + i] = this[layer][z + k][(y + j) * this.mapInfos.size.x + (x + i)];
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
          //block format : [cell, floortint, walltint]
          chunk.datas[k][j * this.CHUNK_SIZE + i] = [
            this.map[z * this.CHUNK_SIZE + k][(y * this.CHUNK_SIZE + j) * this.mapInfos.size.x + (x * this.CHUNK_SIZE + i)],
            this.floorTint[z * this.CHUNK_SIZE + k][(y * this.CHUNK_SIZE + j) * this.mapInfos.size.x + (x * this.CHUNK_SIZE + i)],
            this.wallTint[z * this.CHUNK_SIZE + k][(y * this.CHUNK_SIZE + j) * this.mapInfos.size.x + (x * this.CHUNK_SIZE + i)]
          ];
        }
      }
    }
    this.preparedChunks[chunkKey] = chunk;
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

  removePreparedChunk(key) {
    delete this.preparedChunks[key];
  }
}

module.exports = MapLoader;