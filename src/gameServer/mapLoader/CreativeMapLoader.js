const { ObjectPool } = require("../../utils/gcHelpers");
const { generateRandomId } = require("../../utils/helpers");

class CreativeMapLoader {
  constructor(params, poolSize = 100) {
    this.params = params;
  }

  async initMap(serverMap) {
    this.preparationInterface = serverMap.preparationInterface;

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
        }, {
          heightRatio: 1,
          sprite: "DWARF_MALE",
        }, {
          heightRatio: 1,
          sprite: "ANVIL",
        }, {
          heightRatio: 1,
          sprite: "BAG",
        }, {
          heightRatio: 1,
          sprite: "MIST-MEDIUM",
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
        sprites: ["BARREL", "DWARF_MALE", "ANVIL", "BAG", "MIST-MEDIUM"],
      }
    };

    this.map = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    //init all map values to 1
    for (let j = 0; j < this.mapInfos.size.y; j++) {
      for (let i = 0; i < this.mapInfos.size.x; i++) {
        for(let k = 0; k < this.mapInfos.size.z/2; k++){
          this.map[k][j * this.mapInfos.size.x + i] = 4;
        }
        this.map[25][j * this.mapInfos.size.x + i] = 1;
      }
    }
    this.floorTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.wallTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this._infos = new Map();
    this.rtLayers = [];
    for (let i = 0; i < this.definitions.rtLayerDefinitions.length; i++) {
      this.rtLayers.push(new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0)));
    }
    this.placeables = [];

    this.generateHouse(10, 10, 25, 10, 10);
    this.generateHouse(30, 30, 25, 10, 10);
    this.generateHouse(50, 50, 25, 10, 10);

    this.decors = new Decors(this.placeables, this._infos);

    this.particuleFountains = new ParticuleFountains(this.placeables);

    this.entities = new Entities(this.placeables, this._infos);

    this.particuleFountains.add(4, { x: 52, y: 41, z: 0 }, { xMin: -2, xMax: 2, yMin: -2, yMax: 2 }, 25);

    

    for(let i = 25; i < this.mapInfos.size.z; i++){
      for (let o = Math.random()*100; o>0; o--){
        const entityWaypoint = [];
        for(let way = Math.random()*10; way>0; way--){
          entityWaypoint.push({ x: Math.random()*this.mapInfos.size.x, y: Math.random()*this.mapInfos.size.y })
        }
        this.entities.add(1, generateRandomId(), { x: Math.random()*this.mapInfos.size.x, y: Math.random()*this.mapInfos.size.y, z: i }, {
          waypoints:entityWaypoint,
          infos:{title: "Un truc", texts:["un truc qui bouge"]},
        });
      }

      for (let o = Math.random()*1000; o>0; o--){
        this.decors.add(Math.floor(Math.random()*4), { x: Math.random()*this.mapInfos.size.x, y: Math.random()*this.mapInfos.size.y, z: i }, generateRandomId());
      }

      for (let o = Math.random()*1000; o>0; o--){
        //this.particuleFountains.add(Math.floor(Math.random()*4), { x: Math.random()*this.mapInfos.size.x, y: Math.random()*this.mapInfos.size.y, z: i }, { xMin: -2, xMax: 2, yMin: -2, yMax: 2 }, 25);
      }
    }

    this.liquidSpots = [];
    for(let i = 0; i < 10; i++){
      for(let j = 0; j < 2; j++){
        const ls = new LiquideSpot(44+i, 30+j, 25, 0, 7, true);
        ls.init(this);
        this.liquidSpots.push(ls);
      }
    }

    return this.mapInfos;
  }

  teleportPlayer(player) {
    player.x = this.mapInfos.start.x;
    player.y = this.mapInfos.start.y;
    player.z = this.mapInfos.start.z;
    player.dirty = true;
    console.log("teleporting to cursor");
  }

  playerUpdate(player, delta) {
    //consume orders on player
    for (let order of player.orders) {
      console.log("order", order);
      if (order === "togglePause") {
        const celluleX = Math.floor(player.x - player.dirX);
        const celluleY = Math.floor(player.y - player.dirY);
        this.cycleCell(celluleX, celluleY, player.z);
      }
      if(order === "teleportToCursor"){
        this.teleportPlayer(player);
      }
    }
  }

  update(delta) {
    this.currentTick++;

    this.particuleFountains.update();
    this.entities.update();

    for(let ls of this.liquidSpots){
      ls.update();
    }

    this.preparationInterface.notifyZlevelModification(0);

  }

  changeCell(x, y, z, value, floorTint, wallTint) {
    this.map[z][y * this.mapInfos.size.x + x] = value;
    if (floorTint) {
      this.floorTint[z][y * this.mapInfos.size.x + x] = floorTint;
    }
    if (wallTint) {
      this.wallTint[z][y * this.mapInfos.size.x + x] = wallTint;
    }
    this.preparationInterface.notifyCellModification(x, y, z);
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

class Entities {
  constructor(spriteList, infos) {
    this.spriteList = spriteList;
    this._infos = infos;
    this.entityList = {};
    this.entityInfos = {};
  }

  add(type, id, position, entityInfos) {
    if (this.entityList[id]) {
      console.log("entity already in list");
      return;
    }

    const newSprite = {
      ...position,
      id,
      type,
    }

    
    entityInfos.currentWaypoint = entityInfos.waypoints[0];
    entityInfos.currentWaypointIndex = 0;

    this.entityInfos[newSprite.id] = entityInfos;

    this._infos.set(id, entityInfos.infos);

    this.spriteList.push(newSprite);
    this.entityList[newSprite.id] = newSprite;
  }

  moveTowards(entity, waypoint, speed) {
    const dx = waypoint.x - entity.x;
    const dy = waypoint.y - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > speed) {
      const ratio = speed / distance;
      entity.x += dx * ratio;
      entity.y += dy * ratio;
    } else {
      entity.x = waypoint.x;
      entity.y = waypoint.y;
    }
  }
  
  update() {
    for (let entityID in this.entityList) {
      const entity = this.entityList[entityID];
      const entityInfos = this.entityInfos[entityID];

      if (entity.x === entityInfos.currentWaypoint.x && entity.y === entityInfos.currentWaypoint.y) {
        entityInfos.currentWaypointIndex++
        if (entityInfos.currentWaypointIndex >= entityInfos.waypoints.length) {
          entityInfos.currentWaypointIndex = 0;
        }
        entityInfos.currentWaypoint = entityInfos.waypoints[entityInfos.currentWaypointIndex];
      } else {
        this.moveTowards(entity, entityInfos.currentWaypoint, entityInfos.speed || 0.1);
      }
    }
  }
}

class ParticuleFountains {

  constructor(spriteList) {
    this.spriteList = spriteList;
    this.foutainList = [];
  }

  add(type, position, dimension, proba) {
    const fountain = {
      type,
      ...position,
      dimension,
      proba
    }

    this.foutainList.push(fountain);
  }

  update() {
    for (let fountain of this.foutainList) {
      for (let x = fountain.x + fountain.dimension.xMin; x <= fountain.x + fountain.dimension.xMax; x++) {
        for (let y = fountain.y + fountain.dimension.yMin; y <= fountain.y + fountain.dimension.yMax; y++) {
          if (Math.random() * 100 < fountain.proba) {
            const newSprite = {
              type: fountain.type,
              id: generateRandomId(),
              x,
              y,
              z: fountain.z,
              toRemove: true
            }
            this.spriteList.push(newSprite)
          }
        }
      }
    }
  }
}

class Decors {

  constructor(spriteList, infos) {
    this.spriteList = spriteList;
    this._infos = infos;
    this.decorList = {};
  }

  add(type, position, id) {

    if (this.decorList[id]) {
      console.log("decor already in list");
      return;
    }

    const newSprite = {
      ...position,
      id,
      type,
    }

    this._infos.set(id, { title: "Decors", texts: [`c'est un ${this.infoDecorCorres[type]}`] });

    this.spriteList.push(newSprite);
    this.decorList[newSprite.id] = newSprite;
  }

  get infoDecorCorres() {
    return [
      "barrel",
      "dwarf",
      "anvil",
      "bag",
    ]
  }
}

class LiquideSpot{
  constructor(x, y, z, type, level, variable = false){
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = type;
    this.level = level;
    this.variable = variable;
    this.variableRate = 1;
    this.lastUpdate = Date.now();
  }

  init(map){
    map.changeCell(this.x, this.y, this.z, 0);
    map.changeCell(this.x, this.y, this.z-1, 0);
    map.rtLayers[this.type][this.z-1][this.y * map.mapInfos.size.x + this.x] = this.level;
    this._updateRtLayer = (value) => {
      map.rtLayers[this.type][this.z-1][this.y * map.mapInfos.size.x + this.x] = value;
    };
  }

  update(){
    if(this.variable){
      if(Date.now() - this.lastUpdate > 1000){
        this.level += Math.random() > 0.5 ? this.variableRate : -this.variableRate;
        if(this.level < 0){
          this.level = 0;
        }
        if(this.level > 7){
          this.level = 7;
        }
        this._updateRtLayer(this.level);
        this.lastUpdate = Date.now();
      }
    }
  }
}

module.exports = CreativeMapLoader;
