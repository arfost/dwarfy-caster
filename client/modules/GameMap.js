export class GameMap {

  constructor(connection) {
    this.connection = connection;

    const initDatas = connection.initData;

    this.size = initDatas.mapInfos.size;
    this.chunkSize = initDatas.chunkSize;

    this._map = new Array(this.size.z).fill(0).map(() => new Uint8Array(this.size.x * this.size.y));
    this._wallTint = new Array(this.size.z).fill(0).map(() => new Uint8Array(this.size.x * this.size.y));
    this._floorTint = new Array(this.size.z).fill(0).map(() => new Uint8Array(this.size.x * this.size.y));
    this._infos = new Map();

    this._rtLayers = [];
    for (let layer of initDatas.definitions.rtLayerDefinitions) {
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

  _rtLayersUpdate({ layers, pos, info }) {
    this._infos.set(info.id, info.data);

    this._newPlayerPosition = pos;

    const baseZ = Math.floor(pos.z - this.chunkSize / 2);
    const baseY = Math.floor(pos.y - this.chunkSize / 2);
    const baseX = Math.floor(pos.x - this.chunkSize / 2);

    for(let k = 0; k < this.chunkSize; k++){
      for(let j = 0; j < this.chunkSize; j++){
        for(let i = 0; i < this.chunkSize; i++){
          for(let layerIndex = 0; layerIndex < this._rtLayers.length; layerIndex++){
            if(baseZ + k < 0 || baseZ + k >= this.size.z || baseY + j < 0 || baseY + j >= this.size.y || baseX + i < 0 || baseX + i >= this.size.x) continue;
            this._rtLayers[layerIndex][baseZ + k][(baseY + j) * this.size.x + (baseX + i)] = layers[layerIndex][k][j * this.chunkSize + i];
          }
        }
      }
    }
  }

  cleanChunkBuffer(chunkKey) {}

  _chunkUpdate({ chunkX, chunkY, chunkZ, datas }) {

    const baseX = chunkX * this.chunkSize;
    const baseY = chunkY * this.chunkSize;
    const baseZ = chunkZ * this.chunkSize;

    for (let k = 0; k < this.chunkSize; k++) {
      for (let j = 0; j < this.chunkSize; j++) {
        for (let i = 0; i < this.chunkSize; i++) {
          const index = j * this.chunkSize + i;
          const x = baseX + i;
          const y = baseY + j;
          const z = baseZ + k
          try {
            this._map[z][(y) * this.size.x + (x)] = datas[k][index][0];
            this._floorTint[z][(y) * this.size.x + (x)] = datas[k][index][1];
            this._wallTint[z][(y) * this.size.x + (x)] = datas[k][index][2];
          } catch (e) {
            //console.log("out of bound : ", x, y, z);
          }
        }
      }
    }
    const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
    this.cleanChunkBuffer(chunkKey);
  }

  _placeableUpdate({ zLevel, isPartial, datas }) {
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

  getBlock(x, y, z) {
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return undefined;
    const cell = this._map[z][y * this.size.x + x];
    if(cell === 0) return undefined;
    return this.getCellProperties(cell);
  };

  getWall(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return -1;
    return this.wallGrids[z][y * this.size.x + x];
  };

  getRTLayerCell(layerIndex, x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return -1;
    return this._rtLayers[layerIndex][z][y * this.size.x + x];
  }

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

  getInfos(id) {
    this.infoRequest = id;
    return this._infos.get(id);
  }

  getPlayerChunkCoords(player) {
    return {
      x: Math.floor(player.x / this.chunkSize),
      y: Math.floor(player.y / this.chunkSize),
      z: Math.floor(player.z / this.chunkSize)
    };
  }

  update(seconds, player) {
    if(this._newPlayerPosition){
      player.x = this._newPlayerPosition.x;
      player.y = this._newPlayerPosition.y;
      if(Math.floor(player.z) !== this._newPlayerPosition.z){
        player.z = this._newPlayerPosition.z+0.7;
      }
      this._newPlayerPosition = undefined;
    }
    if (this.connection.ready) {
      this.connection.sendPosition(player.x, player.y, player.z, player.dirX, player.dirY, player.orders, this.infoRequest);
    }
  }
}