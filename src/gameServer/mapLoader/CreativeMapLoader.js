const { ObjectPool } = require("../../utils/gcHelpers");
const { generateRandomId } = require("../../utils/helpers");

class CreativeMapLoader {
  constructor(params, poolSize = 100) {
    this.params = params;
    this.CHUNK_SIZE = 16;
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
  }

  async initMap(serverMap) {
    this.chunkInterface = serverMap.chunkInterface;

    this.mapInfos = {
      size: this.params.size ? this.params.size : { x: 100, y: 100, z: 50 },
      start: this.params.start ? this.params.start : { x: 50, y: 50, z: 25 },
      seed: this.params.seed ? this.params.seed : Math.random(),
    };

    this.definitions = {
      rtLayerDefinitions: [
        {
          name: "water",
          tint: [0, 0, 255]
        },
        {
          name: "magma",
          tint: [255, 0, 0]
        }
      ],
      cellDefinitions: [
        undefined,
        {
          floorTexture: "FLOOR_STONE",
        },
        {
          heightRatio: 1,
          floorTexture: "WALL_STONE",
          wallTexture: "WALL_STONE",
          stopView: true,
        },
        {
          heightRatio: 1,
          floorTexture: "WALL_TREE", 
          wallTexture: "WALL_TREE",
          stopView: true,
        },
        {
          heightRatio: 1,
          floorTexture: "WALL_SOIL",
          wallTexture: "WALL_SOIL", 
          stopView: true,
        },
        {
          floorTexture: "FLOOR_STONE",
        },
        {
          floorTexture: "FLOOR_GRASS",
        },
        {
          heightRatio: 1,
          floorTexture: "FLOOR_STONE",
          wallTexture: "DOOR",
          thinWall: true,
        }
      ],
      placeableDefinitions: [
        {
          heightRatio: 1,
          sprite: "BARREL",
        },{
          heightRatio: 1,
          sprite: "DWARF_MALE",
        }
      ],
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
      assetNames: {
        textures: ["WALL_STONE", "WALL_TREE", "WALL_SOIL", "FLOOR_STONE", "FLOOR_GRASS", "DOOR"],
        sprites: ["BARREL", "DWARF_MALE"],
      }
    };

    this.map = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    //init all map values to 1
    for (let k = 0; k < this.mapInfos.size.z; k++) {
      for (let j = 0; j < this.mapInfos.size.y; j++) {
        for (let i = 0; i < this.mapInfos.size.x; i++) {
          this.map[k][j * this.mapInfos.size.x + i] = 1;
        }
      }
    }
    this.floorTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.wallTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.rtLayers = [];
    for (let i = 0; i < this.definitions.rtLayerDefinitions.length; i++) {
      this.rtLayers.push(new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y)));
    }
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(() => false); 

    
    const basePlaceable = this.placeablePool.getNew();
    basePlaceable.id = 0;
    basePlaceable.x = 45;
    basePlaceable.y = 45;
    basePlaceable.z = 25;
    basePlaceable.type = 0;
    
    this._newPlaceableList = [basePlaceable];
    
    return this.mapInfos;
  }

  update(delta) {
    this.timer = this.timer ? this.timer + delta : delta;
    if (this.timer > 2000) {
      this.timer = 0;
      const newPlaceable = this.placeablePool.getNew();
      newPlaceable.id = generateRandomId();
      newPlaceable.x = 45 + Math.floor(Math.random() * 10);
      newPlaceable.y = 45 + Math.floor(Math.random() * 10);
      newPlaceable.z = 25;
      newPlaceable.type = Math.floor(Math.random() * 2);
      newPlaceable.tick = false;
      this._newPlaceableList.push(newPlaceable);
      if(this._newPlaceableList.length > 10){
        let toRemove = this._newPlaceableList.shift();
        toRemove.tick = true;
      }
      this.cycleCell(48, 48, 25);
    }
    return this._newPlaceableList;
  }

  changeCell(x, y, z, value, floorTint, wallTint) {
    this.map[z][y * this.mapInfos.size.x + x] = value;
    if(floorTint){
      this.floorTint[z][y * this.mapInfos.size.x + x] = floorTint;
    }
    if(wallTint){
      this.wallTint[z][y * this.mapInfos.size.x + x] = wallTint;
    }
    this.chunkInterface.notifyCellModification(x, y, z);
    console.log(this.chunkInterface, this.chunkInterface.notifyCellModification);
  }

  cycleCell(x, y, z) {
    console.log("cycle cell", x, y, z, (this.map[z][y * this.mapInfos.size.x + x] + 1) % this.definitions.cellDefinitions.length);
    this.changeCell(x, y, z, (this.map[z][y * this.mapInfos.size.x + x] + 1) % this.definitions.cellDefinitions.length);
  }
}

module.exports = CreativeMapLoader;