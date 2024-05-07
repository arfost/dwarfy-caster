const { ObjectPool } = require('../utils/gcHelpers.js');
const { prepareDefinitions } = require('./dfDefinitions/ObjectDefinitions.js');

class DummyMapLoader {

  CHUNK_SIZE = 2;

  BLOCK_SIZE = 16;
  BLOCK_SIZE_Z = 1;

  constructor({x, y, z}) {
    this.map = [],
    this.mapInfos = {
      size: {
        x, y, z
      }
    }
    this.placeablePool = new ObjectPool(() => {
      return {
        x: 0,
        y: 0,
        type: 0,
        tick: false
      }
    }, 1000, 500);

    this.definitions = prepareDefinitions();

    this._ready = this.initMap();
  }

  ready() {
    return this._ready;
  }

  async initMap() {

    this.map = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.water = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.magma = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(() => []);
    this.additionnalInfos = new Map();

    //fill map with random values
    for (let z = 0; z < this.mapInfos.size.z; z++) {
      for (let y = 0; y < this.mapInfos.size.y; y++) {
        for (let x = 0; x < this.mapInfos.size.x; x++) {
          this.map[z][y * this.mapInfos.size.x + x] = Math.floor(Math.random() * this.definitions.cellDefinitions.length);
          // this.water[z][y * this.mapInfos.size.x + x] = Math.floor(Math.random() * 2);
          // this.magma[z][y * this.mapInfos.size.x + x] = Math.floor(Math.random() * 2);
        }
      }
    }
    
    const cursor = await this.getCursorPosition();
    return cursor;
  }

  async getCursorPosition() {
    
      return {
        x: this.mapInfos.size.x/2,
        y: this.mapInfos.size.y/2,
        z: Math.floor(this.mapInfos.size.z/2)
      }
  }

  async loadChunk(x, y, z, size, forceReload = true) {
    console.log("load do nothing");
  }
}

module.exports = { DummyMapLoader };