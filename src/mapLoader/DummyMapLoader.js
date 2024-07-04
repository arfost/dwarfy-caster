const MapLoader = require('./MapLoaderBase.js');
const { prepareDefinitions } = require('./dfDefinitions/ObjectDefinitions.js');

class DummyMapLoader extends MapLoader {

  CHUNK_SIZE = 16;

  BLOCK_SIZE = 16;
  BLOCK_SIZE_Z = 1;

  constructor({ x, y, z }) {
    super(550000);
    this.map = [],
      this.mapInfos = {
        size: {
          x, y, z
        },
        chunkSize: 16
      }

    this.definitions = prepareDefinitions();

    this.lastPlaceableUpdate = 0;
    this.movingPlaceablesTargetCount = 50000;

    this._ready = this.initMap();
  }

  async initMap() {

    this.map = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.floorTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.wallTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.water = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.magma = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(() => false);

    const tintInfos = {
      tintDefinitions: [
        false,
        { red: 255, green: 255, blue: 255 },
        { red: 255, green: 0, blue: 0 },
        { red: 0, green: 255, blue: 0 },
        { red: 0, green: 0, blue: 255 },
        { red: 255, green: 255, blue: 0 },
        { red: 255, green: 0, blue: 255 },
        { red: 0, green: 255, blue: 255 },
        { red: 128, green: 128, blue: 128 },
        { red: 255, green: 128, blue: 128 },
        { red: 128, green: 255, blue: 128 },
        { red: 128, green: 128, blue: 255 },
        { red: 255, green: 255, blue: 128 },
      ],
    }

    this.definitions = {
      ...this.definitions,
      ...tintInfos
    }

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
    for (let i = 0; i < this.movingPlaceablesTargetCount; i++) {
      const placeable = this.placeablePool.getNew();
      placeable.id = Math.floor(Math.random() * 1000000);
      placeable.x = Math.floor(Math.random() * 20 + 110);
      placeable.y = Math.floor(Math.random() * 20 + 110);
      placeable.z = Math.floor(Math.random() * 10 + 90);
      placeable.type = Math.floor(Math.random() * this.definitions.placeableDefinitions.length-1)+1;
      placeable.tick = this.currentTick;
      placeable.direction = Math.floor(Math.random() * 4);
      this.updatePlaceable(placeable);
    }

    const cursor = await this.getCursorPosition();
    console.log("init done");
    return cursor;
  }

  async getCursorPosition() {

    return {
      x: this.mapInfos.size.x / 2,
      y: this.mapInfos.size.y / 2,
      z: Math.floor(this.mapInfos.size.z / 2)
    }
  }

  async loadChunk(x, y, z, size, forceReload = true) {
    console.log("load do nothing");
  }

  update(players, seconds) {
    super.update(players, seconds);
    this.lastPlaceableUpdate += seconds;
    console.log("update", this.currentTick, seconds);

    //update placeables
    let tickable = 0;
    for (let id in this.placeableList) {
      const placeable = this.placeableList[id];
      if (placeable.tick) {

        switch (placeable.direction) {
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

        //check if placeable is in bounds
        if (placeable.x > 0 && placeable.x <= this.mapInfos.size.x && placeable.y > 0 && placeable.y <= this.mapInfos.size.y) {
          placeable.tick = this.currentTick;
          tickable++;
        }

        this.updatePlaceable(placeable);
      }

      
    }
    //add new tickable placeables on lvl 90 to 100
    console.log('adding placeables', this.movingPlaceablesTargetCount - tickable);
      for (let i = 0; i < this.movingPlaceablesTargetCount - tickable; i++) {
        const placeable = this.placeablePool.getNew();
        placeable.id = Math.floor(Math.random() * 1000000);
        placeable.z = Math.floor(Math.random() * 10 + 90);
        placeable.x = Math.floor(Math.random() * 20 + 110);
        placeable.y = Math.floor(Math.random() * 20 + 110);
        placeable.type = Math.floor(Math.random() * this.definitions.placeableDefinitions.length);
        placeable.tick = this.currentTick;
        placeable.direction = Math.floor(Math.random() * 4);
        this.updatePlaceable(placeable);
      }
  }
}

module.exports = { DummyMapLoader };