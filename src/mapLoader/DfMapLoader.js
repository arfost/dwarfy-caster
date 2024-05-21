const MapLoader = require('./MapLoaderBase.js');
const { prepareDefinitions } = require('./dfDefinitions/ObjectDefinitions.js');

function isBitOn(number, index) {
  return (number & (1 << index)) ? 1 : 0;
}

class DfMapLoader extends MapLoader {

  CHUNK_SIZE = 16;

  BLOCK_SIZE = 16;
  BLOCK_SIZE_Z = 1;

  constructor(dfClient) {
    super();
    this.map = [];
    this.mapInfos = {};

    this.client = dfClient;


    this.definitions = prepareDefinitions();

    this._ready = this.initMap();
  }

  ready() {
    return this._ready;
  }

  async initMap() {

    await this.client.ready;

    const dfMapInfos = await this.client.request("GetMapInfo");
    this.mapInfos.size = {
      x: dfMapInfos.blockSizeX * this.BLOCK_SIZE,
      y: dfMapInfos.blockSizeY * this.BLOCK_SIZE,
      z: dfMapInfos.blockSizeZ * this.BLOCK_SIZE_Z
    };

    this.initializedBlocks = {};

    this.mapInfos.chunkSize = this.CHUNK_SIZE;

    this.map = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.floorTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.wallTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.water = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.magma = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(() => []);
    this.RTplaceables = new Array(this.mapInfos.size.z).fill(0).map(() => []);

    const tileTypeList = await this.client.request("GetTiletypeList");

    this.tileTypeList = tileTypeList.tiletypeList;

    // const categories = this.tileTypeList.reduce((acc, tileType) => {
    //   acc[`${tileType.shape},${tileType.material},${tileType.special}`] = acc[`${tileType.shape},${tileType.material},${tileType.special}`] || [];
    //   acc[`${tileType.shape},${tileType.material},${tileType.special}`].push(tileType.name);
    //   return acc;
    // }, {});

    const materialList = await this.client.request("GetMaterialList");
    this.materialList = materialList.materialList;
    this.preparedMaterialList = new Map();
    const tintKeys = [""];
    const tintInfos = {
      tintCorrespondances: {},
      tintDefinitions: [
        false,
      ]
    }
    for (let material of this.materialList) {
      const materialKey = `${material.matPair.matIndex},${material.matPair.matType}`;
      this.preparedMaterialList.set(materialKey, material);
      if (material.stateColor) {
        const tintKey = `${material.stateColor.red},${material.stateColor.green},${material.stateColor.blue}`;
        if (!tintKeys.includes(tintKey)) {
          tintKeys.push(tintKey);
          tintInfos.tintDefinitions.push({
            red: material.stateColor.red,
            green: material.stateColor.green,
            blue: material.stateColor.blue
          });
          tintInfos.tintCorrespondances[materialKey] = tintKeys.length - 1;
        } else {
          tintInfos.tintCorrespondances[materialKey] = tintKeys.indexOf(tintKey);
        }
      }
    }

    this.definitions = {
      ...this.definitions,
      ...tintInfos
    }

    const cursor = await this.getCursorPosition();
    return cursor;
  }

  async getCursorPosition() {
    let viewInfos = await this.client.request("GetViewInfo");
    if (viewInfos.cursorPosX === -30000) {
      return {
        x: viewInfos.viewPosX + viewInfos.viewSizeX / 2,
        y: viewInfos.viewPosY + viewInfos.viewSizeY / 2,
        z: viewInfos.viewPosZ
      }
    } else {
      return {
        x: viewInfos.cursorPosX + 0.5,
        y: viewInfos.cursorPosY + 0.5,
        z: viewInfos.cursorPosZ
      }
    }
  }

  lastUpdate = 10000;
  rtUpateTick = 0;
  update(players, seconds) {
    super.update(players, seconds);
    this.lastUpdate += seconds;
    //send RT update every 100ms
    if (this.lastUpdate > 100) {
      this.lastUpdate = 0;
      const activeChunks = [];
      for (let player of players) {
        if (player.stopUpdate) {
          continue;
        }
        //create a list of chunks the player can see
        const keys = this.getChunkKeysForPlayerPosition(player.x, player.y, player.z, 0).map(key => key.split(':')[0]);
        if (!activeChunks.includes(keys)) {
          activeChunks.push(...keys);
        }
      }
      for (let chunk of activeChunks) {
        if (this.initializedBlocks[chunk]) {
          this.loadChunk(chunk, this.rtUpateTick, false);
        } else {
          this.loadChunk(chunk, this.rtUpateTick, true);
          this.initializedBlocks[chunk] = true;
        }
      }
      this.rtUpateTick++;
    }
  }

  dfBlockPositionFromPlayerPosition(x, y, z) {
    return {
      x: Math.floor(x / this.BLOCK_SIZE),
      y: Math.floor(y / this.BLOCK_SIZE),
      z: Math.floor(z / this.BLOCK_SIZE_Z)
    }
  }

  async loadChunk(chunk, tick, forceReload = false) {
    const [x, y, z] = chunk.split(',').map(Number);
    await this.ready();
    const params = { minX: x, minY: y, minZ: z*16, maxX: x + 1, maxY: y + 1, maxZ: z*16 + 16, forceReload };
    try {
      let creatureList = await this.client.request("GetUnitListInside", params);
      let res = await this.client.request("GetBlockList", params);
      for (let block of res.mapBlocks || []) {
        if (block.tiles) {
          this._processDfBlocks(block);
          this.removePreparedChunk(chunk);
        }
        this.RTplaceables[block.mapZ] = this.RTplaceables[block.mapZ].filter(p=>{
          p.release(p);
          return false;
        });
        this._processDfBlocksForDynamic(block, tick);
        for(let crea of creatureList.creatureList || []) {
          this.creatureMap(crea, tick, block.mapZ);
        }
      }
      if(res.mapBlocks.length > 0){
        const buildingList = res.mapBlocks[0].buildings || [];
        for (let building of buildingList) {
          if (building.buildingType) {
            this.buildingMap(building);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  async updateCreatures() {
    let res = await this.client.request("GetUnitListInside", params);
    // console.log("update chunk : ", res, tick);
    for (let crea of res.creatureList || []) {
      this.creatureMap(crea, tick);
    }
  }

  removePreparedChunk(key) {
    console.log("invalidating chunk : ", key);
    delete this.preparedChunks[key];
  }

  _processDfBlocks(block) {
    let basePosition = {
      x: block.mapX,
      y: block.mapY,
      z: block.mapZ
    };

    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        let index = y * 16 + x;
        this.tileMap(block, index, basePosition, x, y);
        this.water[basePosition.z][(basePosition.y + y) * this.mapInfos.size.x + (basePosition.x + x)] = block.water[index];
        this.magma[basePosition.z][(basePosition.y + y) * this.mapInfos.size.x + (basePosition.x + x)] = block.magma[index];
      }
    }
  }

  _processDfBlocksForDynamic(block, tick) {
    if (block.water) {
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          let index = y * 16 + x;
          this.water[block.mapZ][(block.mapY + y) * this.mapInfos.size.x + (block.mapX + x)] = block.water[index];
        }
      }
    }
    if (block.magma) {
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          let index = y * 16 + x;
          this.magma[block.mapZ][(block.mapY + y) * this.mapInfos.size.x + (block.mapX + x)] = block.magma[index];
        }
      }
    }

    for (let flow of block.flows || []) {
      this.flowMap(flow, tick);
    }
    for (let item of block.items || []) {
      this.itemMap(item, tick);
    }
  }

  buildingMap(building) {
    let key = `${building.buildingType.buildingType},${building.buildingType.buildingSubtype},${building.buildingType.buildingCustom}`;

    const matKey = `${building.material.matIndex},${building.material.matType}`;
    const matTintType = this.definitions.tintCorrespondances[matKey] || 0;
    const def = this.definitions.buildingCorrespondances[key];

    if (this.definitions.buildingCorrespondances[key]) {
      for (let x = building.posXMin; x <= building.posXMax; x++) {
        for (let y = building.posYMin; y <= building.posYMax; y++) {
          this._correspondanceResultToMapInfos(def, x, y, building.posZMin);
          if(def.cell){
            this.wallTint[building.posZMin][(y) * this.mapInfos.size.x + (x)] = matTintType;
          }
        }
      }
      this.updatedZlevels.push(building.posZMin);
    }
  }

  itemMap(item, tick) {
    if (!item.pos) {
      return;
    }
    let key = `${item.type.matType},-1`;
    if (this.definitions.itemCorrespondances[key]) {
      this._correspondanceResultToMapInfos(this.definitions.itemCorrespondances[key], item.pos.x, item.pos.y, item.pos.z, tick);
    }
  }

  creatureMap(unit, tick) {
    if (unit.posZ === -30000 || !unit.flags1 || isBitOn(unit.flags1, 1) || isBitOn(unit.flags1, 8) || isBitOn(unit.flags1, 7) || isBitOn(unit.flags1, 25)) {
      return;
    }
    let key = `${unit.race.matType},${unit.race.matIndex}`;
    if (this.definitions.creatureCorrespondances[key]) {
      this._correspondanceResultToMapInfos(this.definitions.creatureCorrespondances[key], unit.posX, unit.posY, unit.posZ, tick);
    }
  }

  flowMap(flow, tick) {
    if (flow.density > 66) {
      this._correspondanceResultToMapInfos(this.definitions.flowCorrespondances[flow.type + "-heavy"], flow.pos.x, flow.pos.y, flow.pos.z, tick);
    } else if (flow.density > 33) {
      this._correspondanceResultToMapInfos(this.definitions.flowCorrespondances[flow.type + "-medium"], flow.pos.x, flow.pos.y, flow.pos.z, tick);
    } else if (flow.density > 0) {
      this._correspondanceResultToMapInfos(this.definitions.flowCorrespondances[flow.type + "-light"], flow.pos.x, flow.pos.y, flow.pos.z, tick);
    }
  }

  tileMap(block, index, basePosition, x, y) {
    let tileType = this.tileTypeList.find(t => t.id === block.tiles[index]);
    if (!tileType) {
      console.log("Tile type not found for", block.tiles[index]);
      return;
    }
    const corres = this._mapDFTileInfosToCell(tileType.shape, tileType.material, tileType.special);
    const matKey = `${block.materials[index].matIndex},${block.materials[index].matType}`;
    const matTintType = this.definitions.tintCorrespondances[matKey] || 0;

    this._correspondanceResultToMapInfos(corres, basePosition.x + x, basePosition.y + y, basePosition.z);
    this.floorTint[basePosition.z][(basePosition.y + y) * this.mapInfos.size.x + (basePosition.x + x)] = matTintType;
    this.wallTint[basePosition.z][(basePosition.y + y) * this.mapInfos.size.x + (basePosition.x + x)] = matTintType;
  }

  _correspondanceResultToMapInfos(correspondanceResult, posX, posY, posZ, tick) {
    if (!correspondanceResult) {
      return;
    }
    if (correspondanceResult.cell) {
      //console.log("updating map : ", posZ, posY * this.mapInfos.size.x + posX, this.map[posZ][posY * this.mapInfos.size.x + posX], correspondanceResult.cell)
      if(correspondanceResult.cell === 41 || this.map[posZ][posY * this.mapInfos.size.x + posX] === 41){
        console.log("door ", this.map[posZ][posY * this.mapInfos.size.x + posX], correspondanceResult.cell, this.definitions.cellDefinitions[correspondanceResult.cell]);
      }
      this.map[posZ][posY * this.mapInfos.size.x + posX] = correspondanceResult.cell;
    }
    if (correspondanceResult.placeable) {
      const newPlaceable = this.placeablePool.getNew();
      newPlaceable.x = posX + 0.5;
      newPlaceable.y = posY + 0.5;
      newPlaceable.type = correspondanceResult.placeable;
      newPlaceable.tick = tick;
      if (tick) {
        this.RTplaceables[posZ].push(newPlaceable);
      } else {
        this.placeables[posZ].push(newPlaceable);
      }
    }
  }


  _mapDFTileInfosToCell(shape, material, special) {
    let key = `${shape},${material},${special}`;

    if (this.definitions.tileCorrespondances[key] !== undefined) {
      return this.definitions.tileCorrespondances[key];
    }
    console.log("no correspondance for", key);

    return {
      cell: 1
    };
  }
}

module.exports = { DfMapLoader };