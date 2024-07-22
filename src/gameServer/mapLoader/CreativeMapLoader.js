const { ObjectPool } = require("../../utils/gcHelpers");

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

  async initMap() {


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

  newPlaceableList() {
    return this._newPlaceableList;
  }
}

module.exports = CreativeMapLoader;