const { ObjectPool } = require('../utils/gcHelpers.js');
const MapLoader = require('./MapLoaderBase.js');
const { prepareDefinitions } = require('./dfDefinitions/ObjectDefinitions.js');

class DummyMapLoader extends MapLoader{

  CHUNK_SIZE = 16;

  BLOCK_SIZE = 16;
  BLOCK_SIZE_Z = 1;

  constructor({x, y, z}) {
    super();
    this.map = [],
    this.mapInfos = {
      size: {
        x, y, z
      },
      chunkSize: 16
    }

    this.definitions = prepareDefinitions();

    this._ready = this.initMap();

    this.lastPlaceableUpdate = 0;
  }

  ready() {
    return this._ready;
  }

  async initMap() {

    this.map = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.floorTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.wallTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.water = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.magma = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(() => []);
    this.RTplaceables = new Array(this.mapInfos.size.z).fill(0).map(() => []);

    const tintInfos = {
      tintDefinitions: [
        false,
        {red: 255, green: 255, blue: 255},
        {red: 255, green: 0, blue: 0},
        {red: 0, green: 255, blue: 0},
        {red: 0, green: 0, blue: 255},
        {red: 255, green: 255, blue: 0},
        {red: 255, green: 0, blue: 255},
        {red: 0, green: 255, blue: 255},
        {red: 128, green: 128, blue: 128},
        {red: 255, green: 128, blue: 128},
        {red: 128, green: 255, blue: 128},
        {red: 128, green: 128, blue: 255},
        {red: 255, green: 255, blue: 128},
      ],
    }

    this.definitions = {
      ...this.definitions,
      ...tintInfos
    }

    //write defintions to a file "definitions.json"
    require("fs").writeFileSync("./data-tests/definitions.json", JSON.stringify(this.definitions, null, 2));

    const possiblesValues = [22, 23, 24, 25, 26, 27, 32, 33]


    //fill map with random values
    for (let z = 0; z < this.mapInfos.size.z; z++) {
      for (let y = 0; y < this.mapInfos.size.y; y++) {
        for (let x = 0; x < this.mapInfos.size.x; x++) {
          this.map[z][y * this.mapInfos.size.x + x] = possiblesValues[Math.floor(Math.random() * possiblesValues.length)];
          this.floorTint[z][y * this.mapInfos.size.x + x] = Math.floor(Math.random() * this.definitions.tintDefinitions.length);
          this.wallTint[z][y * this.mapInfos.size.x + x] = Math.floor(Math.random() * this.definitions.tintDefinitions.length);
        }
      }
    }

    //fill placeables with random values
    for (let z = 0; z < this.mapInfos.size.z; z++) {
      for (let i = 0; i < 100; i++) {
        const placeable = this.placeablePool.getNew();
        placeable.x = Math.floor(Math.random() * this.mapInfos.size.x);
        placeable.y = Math.floor(Math.random() * this.mapInfos.size.y);
        placeable.type = Math.floor(Math.random() * this.definitions.placeableDefinitions.length);
        this.placeables[z].push(placeable);
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

  update(players, seconds) {
    //every 100ms, update placeables
    this.lastPlaceableUpdate += seconds;
    if (this.lastPlaceableUpdate > 100) {
      this.lastPlaceableUpdate = 0;
      for (let z = 90; z < 100; z++) {
        this.RTplaceables[z] = this.RTplaceables[z].filter((placeable) => {
          placeable.duration--;
          //move placeable
          switch(placeable.direction) {
            case 0:
              placeable.x++;
              break;
            case 1:
              placeable.y++;
              break;
            case 2:
              placeable.x--;
              break;
            case 3:
              placeable.y--;
              break;
          }
          if(placeable.duration <= 0) {
            placeable.release(placeable);
            return false;
          }
          return true;
        });
        for (let i = 0; i < 10-this.RTplaceables[z].length; i++) {
          const placeable = this.placeablePool.getNew();
          placeable.x = Math.floor(Math.random() * 20+110);
          placeable.y = Math.floor(Math.random() * 20+110);
          placeable.type = Math.floor(Math.random() * this.definitions.placeableDefinitions.length);
          placeable.duration = 10+Math.floor(Math.random() * 10);
          placeable.direction = Math.floor(Math.random() * 4);
          this.RTplaceables[z].push(placeable);
        }
      }
      this.tick++;
    }
  }
}

module.exports = { DummyMapLoader };