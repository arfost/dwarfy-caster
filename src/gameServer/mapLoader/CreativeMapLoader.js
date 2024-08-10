const { ObjectPool } = require("../../utils/gcHelpers");
const { generateRandomId } = require("../../utils/helpers");

class CreativeMapLoader {
  constructor(params, poolSize = 100) {
    this.params = params;
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
      start: this.params.start ? this.params.start : { x: 50, y: 50, z: 0 },
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
          floorTexture: "FLOOR_GRASS",
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
    for (let j = 0; j < this.mapInfos.size.y; j++) {
      for (let i = 0; i < this.mapInfos.size.x; i++) {
        this.map[0][j * this.mapInfos.size.x + i] = 1;
      }
    }
    this.floorTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.wallTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this._infos = new Map();
    this.rtLayers = [];
    for (let i = 0; i < this.definitions.rtLayerDefinitions.length; i++) {
      this.rtLayers.push(new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y)));
    }
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(() => false);


    const basePlaceable = this.placeablePool.getNew();
    basePlaceable.id = 0;
    basePlaceable.x = 45;
    basePlaceable.y = 45;
    basePlaceable.z = 0;
    basePlaceable.type = 0;

    this._newPlaceableList = [basePlaceable];

    for(let i = 0; i < 3; i++){
      const placeable = this.placeablePool.getNew();
      placeable.id = generateRandomId();
      placeable.x = 50 + Math.random() * 10;
      placeable.y = 50 + Math.random() * 10;
      placeable.z = 0;
      placeable.type = 0;
      this._infos.set(placeable.id, { title: "Baril", texts: ["C'est un baril", "il est vide"] });
      this._newPlaceableList.push(placeable);
    }

    this.generateHouse(10, 10, 0, 10, 10);
    this.generateHouse(30, 30, 0, 10, 10);
    this.generateHouse(50, 50, 0, 10, 10);

    return this.mapInfos;
  }

  playerUpdate(player, delta) {
    //consume orders on player
    for (let order of player.orders) {
      console.log("order", order);
      if (order === "changeCell") {
        const celluleX = Math.floor(player.x - player.dirX);
        const celluleY = Math.floor(player.y - player.dirY);
        this.cycleCell(celluleX, celluleY, player.z);
      }
    }
  }

  update(delta) {
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
  }

  cycleCell(x, y, z) {
    console.log("cycle cell", x, y, z, (this.map[z][y * this.mapInfos.size.x + x] + 1) % this.definitions.cellDefinitions.length);
    this.changeCell(x, y, z, (this.map[z][y * this.mapInfos.size.x + x] + 1) % this.definitions.cellDefinitions.length);
  }

  generateHouse(startX, startY, startZ, width, length) {
    // Vérification des limites de la carte
    if (startX < 0 || startY < 0 || startZ < 0 ||
        startX + width > this.mapInfos.size.x ||
        startY + length > this.mapInfos.size.y ||
        startZ + 3 > this.mapInfos.size.z) {
      console.error("La maison dépasse les limites de la carte");
      return;
    }

    // Constantes pour les types de cellules
    const FLOOR = 5; // FLOOR_STONE
    const WALL = 2;  // WALL_STONE
    const DOOR = 6;  // DOOR

    // Générer le sol
    for (let x = startX; x < startX + width; x++) {
      for (let y = startY; y < startY + length; y++) {
        this.changeCell(x, y, startZ, FLOOR);
      }
    }

    // Générer les murs
    for (let x = startX; x < startX + width; x++) {
      this.changeCell(x, startY, startZ, WALL);
      this.changeCell(x, startY + length - 1, startZ, WALL);
    }
    for (let y = startY; y < startY + length; y++) {
      this.changeCell(startX, y, startZ, WALL);
      this.changeCell(startX + width - 1, y, startZ, WALL);
    }

    // Ajouter une porte
    const doorX = startX + Math.floor(width / 2);
    const doorY = startY;
    this.changeCell(doorX, doorY, startZ, DOOR);
    this._infos.set(`${doorX},${doorY},${startZ}`, { title: "Porte", texts: ["C'est une porte", "elle est ouverte"] });

    // Ajouter un toit simple (juste une couche au-dessus des murs)
    for (let x = startX; x < startX + width; x++) {
      for (let y = startY; y < startY + length; y++) {
        this.changeCell(x, y, startZ + 1, WALL);
      }
    }

    console.log(`Maison générée à la position (${startX}, ${startY}, ${startZ})`);
  }
}

module.exports = CreativeMapLoader;
