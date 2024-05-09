const { ObjectPool } = require('../utils/gcHelpers.js');
const MapLoader = require('./MapLoaderBase.js');
const { prepareDefinitions } = require('./dfDefinitions/ObjectDefinitions.js');

function isBitOn(number, index) {
  return (number & (1 << index)) ? 1 : 0;
}

class DfMapLoader extends MapLoader{

  CHUNK_SIZE = 16;

  BLOCK_SIZE = 16;
  BLOCK_SIZE_Z = 1;

  constructor(dfClient) {
    super();
    this.map = [];
    this.mapInfos = {};

    this.client = dfClient;
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

    await this.client.ready;

    const dfMapInfos = await this.client.request("GetMapInfo");
    this.mapInfos.size = {
      x: dfMapInfos.blockSizeX * this.BLOCK_SIZE,
      y: dfMapInfos.blockSizeY * this.BLOCK_SIZE,
      z: dfMapInfos.blockSizeZ * this.BLOCK_SIZE_Z
    };

    this.mapInfos.chunkSize = this.CHUNK_SIZE;

    this.map = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.floorTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.wallTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.water = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.magma = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(() => []);

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

  async loadChunk(x, y, z, size, forceReload = true) {
    await this.ready();
    const params = { minX: x, minY: y, minZ: z, maxX: x + size, maxY: y + size, maxZ: z + size * 16, forceReload };
    console.log("loading chunk : ", params);
    try {
      let res = await this.client.request("GetBlockList", params);
      this._processDfBlocks(res.mapBlocks || []);
    } catch (e) {
      console.log(e);
    }
  }

  

  _processDfBlocks(blocks) {
    if (blocks.length === 0) {
      return;
    }
    for (let block of blocks) {
      let basePosition = {
        x: block.mapX,
        y: block.mapY,
        z: block.mapZ
      }
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          let index = y * 16 + x;
          this.tileMap(block, index, basePosition, x, y);
          this.water[basePosition.z][(basePosition.y + y) * this.mapInfos.size.x + (basePosition.x + x)] = block.water[index];
          this.magma[basePosition.z][(basePosition.y + y) * this.mapInfos.size.x + (basePosition.x + x)] = block.magma[index];
        }
      }
    }
    for (let building of blocks[0].buildings || []) {
      if (building.buildingType) {
        this.buildingMap(building);
      }
    }
  }

  async updateChunk(x, y, z, size, tick, currentZ) {
    await this.ready();
    const params = { minX: x, minY: y, minZ: z, maxX: x + size, maxY: y + size, maxZ: z + size };
    try {
      let res = await this.client.request("GetBlockList", params);
      // console.log("update chunk : ", res, tick);
      this._processDfBlocksForDynamic(res.mapBlocks || [], tick, currentZ);
    } catch (e) {
      console.log(e);
    }
    try {
      let res = await this.client.request("GetUnitListInside", params);
      // console.log("update chunk : ", res, tick);
      for (let crea of res.creatureList || []) {
        this.creatureMap(crea, tick, currentZ);
      }
    } catch (e) {
      console.log(e);
    }
  }

  _processDfBlocksForDynamic(blocks, tick, currentZ) {
    for (let block of blocks) {
      if (block.water) {
        for (let x = 0; x < 16; x++) {
          for (let y = 0; y < 16; y++) {
            let index = y * 16 + x;
            this.water[block.mapZ][(block.mapY + y) * this.mapInfos.size.x + (block.mapX + x)] = block.water[index];
          }
        }
      }
      for (let flow of block.flows || []) {
        this.flowMap(flow, tick, currentZ);
      }
      for (let item of block.items || []) {
        this.itemMap(item, tick, currentZ);
      }
    }
  }

  buildingMap(building) {
    let key = `${building.buildingType.buildingType},${building.buildingType.buildingSubtype},${building.buildingType.buildingCustom}`;
    if (this.definitions.buildingCorrespondances[key]) {
      for (let x = building.posXMin; x <= building.posXMax; x++) {
        for (let y = building.posYMin; y <= building.posYMax; y++) {
          this._correspondanceResultToMapInfos(this.definitions.buildingCorrespondances[key], x, y, building.posZMin);
        }
      }
    }
  }

  itemMap(item, tick, currentZ) {
    if (!item.pos || item.pos.z !== currentZ) {
      return;
    }
    let key = `${item.type.matType},-1`;
    if (this.definitions.itemCorrespondances[key]) {
      this._correspondanceResultToMapInfos(this.definitions.itemCorrespondances[key], item.pos.x, item.pos.y, item.pos.z, tick);
    }
  }

  creatureMap(unit, tick, currentZ) {
    if (unit.posZ === -30000 || unit.posZ !== currentZ || !unit.flags1 || isBitOn(unit.flags1, 1) || isBitOn(unit.flags1, 8) || isBitOn(unit.flags1, 7) || isBitOn(unit.flags1, 25)) {
      return;
    }
    let key = `${unit.race.matType},${unit.race.matIndex}`;
    if (this.definitions.creatureCorrespondances[key]) {
      this._correspondanceResultToMapInfos(this.definitions.creatureCorrespondances[key], unit.posX, unit.posY, unit.posZ, tick);
    }
  }

  flowMap(flow, tick, currentZ) {
    if (flow.pos.z !== currentZ) return;
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
    const matTintType = this.definitions.tintCorrespondances[matKey];
    
    this._correspondanceResultToMapInfos(corres, basePosition.x + x, basePosition.y + y, basePosition.z);
    this.floorTint[basePosition.z][(basePosition.y + y) * this.mapInfos.size.x + (basePosition.x + x)] = matTintType;
    this.wallTint[basePosition.z][(basePosition.y + y) * this.mapInfos.size.x + (basePosition.x + x)] = matTintType;
  }

  _correspondanceResultToMapInfos(correspondanceResult, posX, posY, posZ, tick = false) {
    if (!correspondanceResult) {
      return;
    }
    if (correspondanceResult.cell) {
      this.map[posZ][posY * this.mapInfos.size.x + posX] = correspondanceResult.cell;
    }
    if (correspondanceResult.placeable) {
      const newPlaceable = this.placeablePool.getNew();
      newPlaceable.x = posX + 0.5;
      newPlaceable.y = posY + 0.5;
      newPlaceable.type = correspondanceResult.placeable;
      newPlaceable.tick = tick;
      this.placeables[posZ].push(newPlaceable);
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