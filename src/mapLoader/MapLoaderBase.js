const { ObjectPool } = require("../utils/gcHelpers");

class MapLoader {

  constructor() {
    this.preparedChunks = {};
    this.placeablePool = new ObjectPool(() => {
      return {
        x: 0,
        y: 0,
        type: 0,
        creaDate: 0,
        tick: false
      }
    }, 1000, 500);
  }

  update(players, seconds){
    const activeChunks = [];
    for(let player of players){
      if(player.stopUpdate){
        continue;
      }
      //create a list of chunks the player can see
      const keys = this.getChunkKeysForPlayerPosition(player.x, player.y, player.z, 1);
      if(!activeChunks.includes(keys)){
        activeChunks.push(...keys);
      }
    }
    this._asyncUpdate(activeChunks, seconds);
    this._syncUpdate(activeChunks, seconds);
  }

  async _asyncUpdate(){}
  _syncUpdate(){}

  getPlaceablesForLevel(level) {
    return this.placeables[level];
  };

  getRTPlaceablesForLevel(level) {
    console.log("getRTPlaceablesForLevel", level, this.RTplaceables[level].length);
    return this.RTplaceables[level];
  }

  getRTWaterForPosition(x, y, z) {
    const water = [];
    //get one chunk size around the player
    for (let k = 0; k < this.CHUNK_SIZE; k++) {
      water[k] = [];
      for (let j = 0; j < this.CHUNK_SIZE; j++) {
        for (let i = 0; i < this.CHUNK_SIZE; i++) {
          water[k][j * this.CHUNK_SIZE + i] = this.water[z + k][(y + j) * this.mapInfos.size.x + (x + i)];
        }
      }
    }
    return water;
  }

  getRTMagmaForPosition(x, y, z) {
    const magma = [];
    //get one chunk size around the player
    for (let k = 0; k < this.CHUNK_SIZE; k++) {
      magma[k] = [];
      for (let j = 0; j < this.CHUNK_SIZE; j++) {
        for (let i = 0; i < this.CHUNK_SIZE; i++) {
          magma[k][j * this.CHUNK_SIZE + i] = this.magma[z + k][(y + j) * this.mapInfos.size.x + (x + i)];
        }
      }
    }
    return magma;
  }

  prepareChunk(chunkKey) {
    let [x, y, z] = chunkKey.split(',').map(Number);
    if (!this.preparedChunks[chunkKey]) {
      let chunk = {
        chunkX: x,
        chunkY: y,
        chunkZ: z
      };
      chunk.datas = new Array(this.CHUNK_SIZE).fill(0).map(() => []);
      for (let i = 0; i < this.CHUNK_SIZE; i++) {
        for (let j = 0; j < this.CHUNK_SIZE; j++) {
          for (let k = 0; k < this.CHUNK_SIZE; k++) {
            //block format : [cell, water, magma]
            chunk.datas[k][j*this.CHUNK_SIZE + i] = [
              this.map[z + k][(y + j) * this.mapInfos.size.x + (x + i)],
              this.floorTint[z + k][(y + j) * this.mapInfos.size.x + (x + i)],
              this.wallTint[z + k][(y + j) * this.mapInfos.size.x + (x + i)]
            ];
          }
        }
      }
      this.preparedChunks[chunkKey] = chunk;
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
          chunks.push(`${chunkX + i},${chunkY + j},${chunkZ + k}`);
        }
      }
    }
    return chunks;
  }

  getChunksForChunkKeys(keys) {
    return keys.map(key => {
      if(!this.preparedChunks[key]){
        this.prepareChunk(key);
      }
      return this.preparedChunks[key];
    });
  }

  getChunkForChunkKey(key) {
    if(!this.preparedChunks[key]){
      this.prepareChunk(key);
    }
    return this.preparedChunks[key];
  }
}

module.exports = MapLoader;