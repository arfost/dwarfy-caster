class MapLoader {

  constructor() {
    this.preparedChunks = {};
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