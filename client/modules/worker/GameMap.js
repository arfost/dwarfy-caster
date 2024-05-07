export class GameMap {

  constructor(connection) {
    this.connection = connection;

    const initDatas = connection.initData;

    this.size = initDatas.mapInfos.size;

    this._map = new Array(this.size.z).fill(0).map(() => new Uint8Array(this.size.x * this.size.y));
    this._water = new Array(this.size.z).fill(0).map(() => new Uint8Array(this.size.x * this.size.y));
    this._magma = new Array(this.size.z).fill(0).map(() => new Uint8Array(this.size.x * this.size.y));
    this._placeables = new Array(this.size.z).fill(0).map(() => []);
    this._additionnalInfos = new Map();

    this.cellProperties = initDatas.definitions.cellDefinitions;
    this.placeableProperties = initDatas.definitions.placeableDefinitions;

    this.connection.onmapupdate = this._receiveUpdate.bind(this);
  }

  _receiveUpdate({map, placeables}){
    //update map
    for (let z = 0; z < this.size.z; z++) {
      for (let y = 0; y < this.size.y; y++) {
        for (let x = 0; x < this.size.x; x++) {
          this._map[z][y * this.size.x + x] = map[z][y * this.size.x + x];
        }
      }
    }

    //update placeables
    for (let z = 0; z < this.size.z; z++) {
      this._placeables[z] = placeables[z];
    }
  }

  get placeables() {
    return this._placeables;
  }
  
  get wallAdditionnalInfos() {
    return this._additionnalInfos;
  }

  get wallGrids(){
    return this._map;
  }

  get waterGrids(){
    return this._water;
  }

  get magmaGrids(){
    return this._magma;
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

  getWallAdditionnalInfos(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size.x - 1 || y < 0 || y > this.size.y - 1 || this.size.z - 1 < z || z < 0) return -1;
    return this.wallAdditionnalInfos.get(`${x},${y},${z}`);
  };
}

