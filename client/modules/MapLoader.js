import { prepareDefinitions } from "./ObjectDefinitions.js";
import { isBitOn } from "./functions.js";
import { ObjectPool } from "./utils/ObjectPool.js";

export class DfMapLoader {

  CHUNK_SIZE = 2;

  BLOCK_SIZE = 16;
  BLOCK_SIZE_Z = 1;

  constructor() {
    this.map = [],
      this.mapInfos = {}
    this.client = new DwarfClient();
    this.placeablePool = new ObjectPool(() => {
      return {
        x: 0,
        y: 0,
        type: 0,
        tick: false
      }
    }, 1000, 500);
  }

  ready() {
    return this.client ? this.client._initialized : false
  }

  async initMap() {

    this.definitions = prepareDefinitions();
    console.log("blockProperties", this.definitions);

    await this.ready();

    const dfMapInfos = await this.client.GetMapInfo();
    console.log(dfMapInfos);
    this.mapInfos.size = {
      x: dfMapInfos.blockSizeX * this.BLOCK_SIZE,
      y: dfMapInfos.blockSizeY * this.BLOCK_SIZE,
      z: dfMapInfos.blockSizeZ * this.BLOCK_SIZE_Z
    };

    this.map = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.water = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.magma = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y));
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(() => []);
    this.additionnalInfos = new Map();

    const tileTypeList = await this.client.GetTiletypeList();

    this.tileTypeList = tileTypeList.tiletypeList;

    const categories = this.tileTypeList.reduce((acc, tileType) => {
      acc[`${tileType.shape},${tileType.material},${tileType.special}`] = acc[`${tileType.shape},${tileType.material},${tileType.special}`] || [];
      acc[`${tileType.shape},${tileType.material},${tileType.special}`].push(tileType.name);
      return acc;
    }, {});

    console.log(tileTypeList, categories);
    
    const materialList = await this.client.GetMaterialList();
    this.materialList = materialList.materialList;
    this.preparedMaterialList = new Map();
    for (let material of this.materialList) {
      this.preparedMaterialList.set(`${material.matPair.matIndex},${material.matPair.matType}`, material);
    }
    
    const cursor = await this.getCursorPosition();
    return cursor;
  }

  async getCursorPosition() {
    let viewInfos = await this.client.GetViewInfo();
    console.log("viewInfos", viewInfos);
    if (viewInfos.cursorPosX === -30000) {
      return {
        x: viewInfos.viewPosX + viewInfos.viewSizeX / 2,
        y: viewInfos.viewPosY + viewInfos.viewSizeY / 2,
        z: viewInfos.viewPosZ
      }
    } else {
      return {
        x: viewInfos.cursorPosX,
        y: viewInfos.cursorPosY,
        z: viewInfos.cursorPosZ
      }
    }
  }

  async loadChunk(x, y, z, size, forceReload = true) {
    await this.ready();
    const params = { minX: x, minY: y, minZ: z, maxX: x + size, maxY: y + size, maxZ: z + size, forceReload };
    console.log("loading chunk : ", params);
    try {
      let res = await this.client.GetBlockList(params);
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
    console.log("Block groub loaded", (blocks[0].buildings || []).filter(b => b.buildingType));
  }

  async passKeyboardInput(input) {
    await this.ready();
    try {
      let res = await this.client.PassKeyboardEvent(input);
      console.log("passKeyboardInput", res);
    } catch (e) {
      console.log(e);
    }
  }

  async sendDfToPosition(x, y, z) {
    console.log("sendDfToPosition", x, y, z);
  }

  async updateChunk(x, y, z, size, tick, currentZ) {
    await this.ready();
    const params = { minX: x, minY: y, minZ: z, maxX: x + size, maxY: y + size, maxZ: z + size };
    try {
      let res = await this.client.GetBlockList(params);
      // console.log("update chunk : ", res, tick);
      this._processDfBlocksForDynamic(res.mapBlocks || [], tick);
    } catch (e) {
      console.log(e);
    }
    try {
      let res = await this.client.GetUnitListInside(params);
      // console.log("update chunk : ", res, tick);
      for(let crea of res.creatureList || []) {
        this.creatureMap(crea, tick, currentZ);
      }
    } catch (e) {
      console.log(e);
    }
  }

  _processDfBlocksForDynamic(blocks, tick, currentZ) {
    for(let block of blocks){
      if(block.water){
        for (let x = 0; x < 16; x++) {
          for (let y = 0; y < 16; y++) {
            let index = y * 16 + x;
            this.water[block.mapZ][(block.mapY + y) * this.mapInfos.size.x + (block.mapX + x)] = block.water[index];
          }
        }
      }
      for(let flow of block.flows || []){
        this.flowMap(flow, tick);
      }
      for(let item of block.items || []){
        this.itemMap(item, tick, currentZ);
      }
    }
  }

  buildingMap(building) {
    let key = `${building.buildingType.buildingType},${building.buildingType.buildingSubtype},${building.buildingType.buildingCustom}`;
    if(this.definitions.buildingCorrespondances[key]){
      for (let x = building.posXMin; x <= building.posXMax; x++) {
        for (let y = building.posYMin; y <= building.posYMax; y++) {
          this._correspondanceResultToMapInfos(this.definitions.buildingCorrespondances[key], x, y, building.posZMin);
        }
      }
    }
  }

  itemMap(item, tick, currentZ) {
    if(!item.pos) return;
    let key = `${item.type.matType},-1`;
    if(this.definitions.itemCorrespondances[key]){
      this._correspondanceResultToMapInfos(this.definitions.itemCorrespondances[key], item.pos.x, item.pos.y, item.pos.z, tick);
    }
  }

  creatureMap(unit, tick, currentZ) {
    if(unit.posZ === -30000 || unit.posZ !== currentZ || !unit.flags1 || isBitOn(unit.flags1, 1) || isBitOn(unit.flags1, 8) || isBitOn(unit.flags1, 7) || isBitOn(unit.flags1, 25)){
      return;
    }
    let key = `${unit.race.matType},${unit.race.matIndex}`;
    if(this.definitions.creatureCorrespondances[key]){
      this._correspondanceResultToMapInfos(this.definitions.creatureCorrespondances[key], unit.posX, unit.posY, unit.posZ, tick);
    }
  }

  flowMap(flow, tick, currentZ) {
    if(flow.density > 66, flow.pos.z !== currentZ){
      this._correspondanceResultToMapInfos(this.definitions.flowCorrespondances[flow.type+"-heavy"], flow.pos.x, flow.pos.y, flow.pos.z, tick);
    }else if(flow.density > 33){
      this._correspondanceResultToMapInfos(this.definitions.flowCorrespondances[flow.type+"-medium"], flow.pos.x, flow.pos.y, flow.pos.z, tick);
    }else if(flow.density > 0){
      this._correspondanceResultToMapInfos(this.definitions.flowCorrespondances[flow.type+"-light"], flow.pos.x, flow.pos.y, flow.pos.z, tick);
    }
  }

  tileMap(block, index, basePosition, x, y) {
    let tileType = this.tileTypeList.find(t => t.id === block.tiles[index]);
    if (!tileType) {
      console.log("Tile type not found for", block.tiles[index]);
      return;
    }
    const corres = this._mapDFTileInfosToCell(tileType.shape, tileType.material, tileType.special);
    const material = this.preparedMaterialList.get(`${block.materials[index].matIndex},${block.materials[index].matType}`);

    this.additionnalInfos.set(`${basePosition.x + x},${basePosition.y + y},${basePosition.z}`, {
      tint: material ? [material.stateColor.red, material.stateColor.green, material.stateColor.blue] : false
    });
    this._correspondanceResultToMapInfos(corres, basePosition.x + x, basePosition.y + y, basePosition.z);
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

