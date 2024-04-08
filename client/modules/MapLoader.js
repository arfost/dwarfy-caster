import { prepareDefinitions } from "./ObjectDefinitions.js";

const DEFAULT_MAP =   [
  [
    4, 4, 4, 4, 4, 4, 4, 4, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 23, 4, 4, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 23, 4, 4, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 23, 4, 4, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 23, 23, 23, 23, 23, 23, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 23, 23, 23, 23, 23, 23, 23, 23, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 23, 23, 23, 23, 23, 23, 23, 23, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 23, 23, 23, 23, 23, 23, 23, 23, 23, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
  ],
  [
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 0, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 0, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 0, 23, 23, 23, 0, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 0, 0, 23, 23, 19, 19, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 0, 0, 23, 23, 3, 3, 3, 30, 3, 3, 3, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 3, 23, 23, 23, 23, 3, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 3, 23, 23, 23, 23, 3, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 3, 23, 23, 23, 23, 3, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 3, 23, 23, 23, 23, 3, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 3, 3, 3, 3, 3, 3, 3, 3, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
  ]
]

const DEFAULT_PLACEABLES = [
  [],[{
    x: 2.5,
    y: 4.5,
    type: 3
  },{
    x: 5.5,
    y: 4.5,
    type: 1
  },{
    x: 2.5,
    y: 7.5,
    type: 5
  },{
    x: 12.5,
    y: 14.5,
    type: 2
  },{
    x: 2.5,
    y: 24.5,
    type: 3
  },{
    x: 22.5,
    y: 4.5,
    type: 5
  },{
    x: 12.5,
    y: 7.5,
    type: 2
  }]
]

export class DefaultMapLoader {

  CHUNK_SIZE = 2;

  BLOCK_SIZE = 32;
  BLOCK_SIZE_Z = 2;

  constructor(heigthModifier = 1) {
    this.map = [],
      this.mapInfos = {}
    this.heigthModifier = heigthModifier;
  }

  async initMap() {

    this.definitions = prepareDefinitions();
    console.log("blockProperties", this.definitions);

    this.map = [];
    for (let z = 0; z < this.heigthModifier; z++) {
      this.map.push(...DEFAULT_MAP);
    }
    this.mapInfos.size = { x: 32, y: 32, z: 2 * this.heigthModifier };
    this.placeables = [];
    for (let z = 0; z < this.heigthModifier; z++) {
      this.placeables.push(...DEFAULT_PLACEABLES);
    }

    this.additionnalInfos = new Map();
    this.additionnalInfos.set("7,8,1", {
      tint: "yellow"
    });
    this.additionnalInfos.set("10,10,1", {
      tint: "blue"
    });
    this.additionnalInfos.set("12,10,1", {
      tint: "red"
    });

    const cursor = await this.getCursorPosition();
    return cursor;
  }

  async getCursorPosition(){
    return {
      x: 2,
      y: 2,
      z: 1
    }
  }

  async loadChunk(x, y, z, size, forceReload = true) {
    console.log("loading chunk but for test map so do nothing : ", { x, y, z, size, forceReload });
  }

}

export class DfMapLoader {

  CHUNK_SIZE = 2;

  BLOCK_SIZE = 16;
  BLOCK_SIZE_Z = 1;

  constructor() {
    this.map = [],
    this.mapInfos = {}
    this.client = new DwarfClient();
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
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(()=>[]);
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
    console.log(materialList);

    const cursor = await this.getCursorPosition();
    return cursor;
  }

  async getCursorPosition(){
    let viewInfos = await this.client.GetViewInfo();
    console.log("viewInfos", viewInfos);
    if(viewInfos.cursorPosX === -30000){
      return {
        x: viewInfos.viewPosX + viewInfos.viewSizeX / 2,
        y: viewInfos.viewPosY + viewInfos.viewSizeY / 2,
        z: viewInfos.viewPosZ
      }
    }else{
      return {
        x: viewInfos.cursorPosX,
        y: viewInfos.cursorPosY,
        z: viewInfos.cursorPosZ
      }
    }
  }

  async loadChunk(x, y, z, size, forceReload = true) {
    await this.ready();
    const params = { minX: x, minY: y, minZ: z, maxX: x + size + 1, maxY: y + size + 1, maxZ: z + size + 1, forceReload };
    console.log("loading chunk : ", params);
    try {
      let res = await this.client.GetBlockList(params);
      this._processDfBlocks(res.mapBlocks || []);
    } catch (e) {
      console.log(e);
    }
  }

  _processDfBlocks(blocks) {
    const aggregatedTileInfos = [];
    for (let block of blocks) {
      let basePosition = {
        x: block.mapX,
        y: block.mapY,
        z: block.mapZ
      }
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          let index = y * 16 + x;
          const aggregatedTile = {
            id: block.tiles[index],
            tileInfos: this.tileTypeList.find(t => t.id === block.tiles[index]),
            materials: this.materialList.find(m => m.matPair.matIndex === block.materials[index].matIndex && m.matPair.matType === block.materials[index].matType),
            aquifer: block.aquifer[index],
            baseMaterials: this.materialList.find(m => m.matPair.matIndex === block.baseMaterials[index].matIndex && m.matPair.matType === block.materials[index].matType),
            constructionItems: this.materialList.find(m => m.matPair.matIndex === block.constructionItems[index].matIndex && m.matPair.matType === block.materials[index].matType),
            grassPercent: block.grassPercent[index],
            hidden: block.hidden[index],
            layerMaterials: this.materialList.find(m => m.matPair.matIndex === block.layerMaterials[index].matIndex && m.matPair.matType === block.materials[index].matType),
            light: block.light[index],
            magma: block.magma[index],
            mapX: basePosition.x + x,
            mapY: basePosition.y + y,
            mapZ: basePosition.z,
            outside: block.outside[index],
            spatterPile: block.spatterPile[index],
            subterranean: block.subterranean[index],
            tileDigDesignation: block.tileDigDesignation[index],
            tileDigDesignationAuto: block.tileDigDesignationAuto[index],
            tileDigDesignationMarker: block.tileDigDesignationMarker[index],
            treePercent: block.treePercent[index],
            treeX: block.treeX[index],
            treeY: block.treeY[index],
            treeZ: block.treeZ[index],
            veinMaterials: this.materialList.find(m => m.matPair.matIndex === block.veinMaterials[index].matIndex && m.matPair.matType === block.materials[index].matType),
            water: block.water[index],
            waterSalt: block.waterSalt[index],
            waterStagnant: block.waterStagnant[index],
          }
          aggregatedTileInfos.push(aggregatedTile);
          let tileType = this.tileTypeList.find(t => t.id === block.tiles[index]);
          if (!tileType) {
            console.log("Tile type not found for", block.tiles[index]);
            continue;
          }
          const corres = this._mapDFTileInfosToCell(tileType.shape, tileType.material, tileType.special);
          const material = this.materialList.find(m => m.matPair.matIndex === block.materials[index].matIndex && m.matPair.matType === block.materials[index].matType);
          this.additionnalInfos.set(`${basePosition.x + x},${basePosition.y + y},${basePosition.z}`, {
            tint: material ? [material.stateColor.red, material.stateColor.green, material.stateColor.blue] : false
          });
          this._correspondanceResultToMapInfos(corres, basePosition.x + x, basePosition.y + y, basePosition.z);

        }
      }
    }
    for (let building of blocks[0].buildings || []) {
      if (building.buildingType && this.definitions.buildingCorrespondances[building.buildingType.buildingType]) {
        this._correspondanceResultToMapInfos(this.definitions.buildingCorrespondances[building.buildingType.buildingType], building.posXMin, building.posYMin, building.posZMin);
      }
    }
    console.log("Block groub loaded", aggregatedTileInfos);
  }

  _correspondanceResultToMapInfos(correspondanceResult, posX, posY, posZ) {
    if(!correspondanceResult){
      return;
    }
    if(correspondanceResult.cell){
      this.map[posZ][posY * this.mapInfos.size.x + posX] = correspondanceResult.cell;
    }
    if(correspondanceResult.placeable){
      this.placeables[posZ].push({
        x: posX + 0.5,
        y: posY + 0.5,
        type: correspondanceResult.placeable
      });
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

