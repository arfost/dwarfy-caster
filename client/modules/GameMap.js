export class GameMap {

  constructor(connection) {
    this.connection = connection;

    const initDatas = connection.initData;

    this.size = initDatas.mapInfos.size;
    this.chunkSize = initDatas.chunkSize;

    this._map = new Array(this.size.z).fill(0).map(() => new Uint8Array(this.size.x * this.size.y));
    this._wallTint = new Array(this.size.z).fill(0).map(() => new Uint8Array(this.size.x * this.size.y));
    this._floorTint = new Array(this.size.z).fill(0).map(() => new Uint8Array(this.size.x * this.size.y));

    this._rtLayers = [];
    for(let layer of initDatas.definitions.rtLayerDefinitions){
      this._rtLayers.push(new Array(this.size.z).fill(0).map(() => new Uint8Array(this.size.x * this.size.y)));
    }
    this._placeables = new Array(this.size.z).fill(0).map(() => []);

    this.cellProperties = initDatas.definitions.cellDefinitions;
    this.placeableProperties = initDatas.definitions.placeableDefinitions;
    this.tintDefinitions = initDatas.definitions.tintDefinitions;

    this.connection.onChunk = this._chunkUpdate.bind(this);
    this.connection.onPlaceables = this._placeableUpdate.bind(this);
    this.connection.onRTLayers = this._rtLayersUpdate.bind(this);
  }

  _rtLayersUpdate({ layers, pos }) {
    //update water and magma from player position up to chunk size

    for (let k = 0; k < this.chunkSize; k++) {
      for (let j = 0; j < this.chunkSize; j++) {
        for (let i = 0; i < this.chunkSize; i++) {
          for(let layerIndex = 0; layerIndex < this._rtLayers.length; layerIndex++){
            this._rtLayers[layerIndex][pos.z + k][(pos.y + j) * this.size.x + (pos.x + i)] = layers[layerIndex][j * this.chunkSize + i];
          }
        }
      }
    }
  }

  _chunkUpdate({ chunkX, chunkY, chunkZ, datas }) {
    const baseX = chunkX * this.chunkSize;
    const baseY = chunkY * this.chunkSize;
    const baseZ = chunkZ * this.chunkSize;

    for (let k = 0; k < this.chunkSize; k++) {
      for (let j = 0; j < this.chunkSize; j++) {
        for (let i = 0; i < this.chunkSize; i++) {
          const index = j * this.chunkSize + i;
          this._map[baseZ + k][(baseY + j) * this.size.x + (baseX + i)] = datas[k][index][0];
          this._floorTint[baseZ + k][(baseY + j) * this.size.x + (baseX + i)] = datas[k][index][1];
          this._wallTint[baseZ + k][(baseY + j) * this.size.x + (baseX + i)] = datas[k][index][2];
        }
      }
    }
  }

  _placeableUpdate({ zLevel, isPartial, datas }) {
    console.log("placeable update", zLevel, datas.length);
    if (isPartial) {
      this._placeables[zLevel] = [...this._placeables[zLevel], ...datas];
    } else {
      this._placeables[zLevel] = datas;
    }
  }

  get placeables() {
    return this._placeables;
  }

  get floorTintGrids() {
    return this._floorTint;
  }

  get wallTintGrids() {
    return this._wallTint;
  }

  get wallGrids() {
    return this._map;
  }

  get waterGrids() {
    return this._rtLayers[0];
  }

  get magmaGrids() {
    return this._rtLayers[1];
  }

  getCellProperties(type) {
    return this.cellProperties[type];
  }

  getPlaceableProperties(type) {
    return this.placeableProperties[type];
  }

  getTintProperties(type) {
    return this.tintProperties[type];
  }

  getWall(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return -1;
    return this.wallGrids[z][y * this.size.x + x];
  };

  getCellWater(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return -1;
    return this.waterGrids[z][y * this.size.x + x];
  };

  getCellMagma(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return -1;
    return this.magmaGrids[z][y * this.size.x + x];
  };

  getFloorTint(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return -1;
    return this.floorTintGrids[z][y * this.size.x + x];
  };

  getWallTint(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return -1;
    return this.wallTintGrids[z][y * this.size.x + x];
  };

  update(seconds, player) {
    if (this.connection.ready) {
      this.connection.sendPosition(player.x, player.y, player.z);
    }
  }
}