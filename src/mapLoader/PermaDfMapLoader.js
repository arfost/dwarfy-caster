const MapLoader = require('./MapLoaderBase.js');
const { prepareDefinitions } = require('./dfDefinitions/ObjectDefinitions.js');

class PermaDfMapLoader extends MapLoader {

  CHUNK_SIZE = 16;

  BLOCK_SIZE = 16;
  BLOCK_SIZE_Z = 1;

  constructor(dfHackConnection) {
    super(50000);
    this.client = dfHackConnection;
    this.map = [];
    this.mapInfos = {};

    this.definitions = prepareDefinitions();

    this._ready = this.initMap();
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

    this.map = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.floorTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.wallTint = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.water = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.magma = new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(() => false);

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

    this.blockToInit = this._generateSpiralBlocksToLoad3D(Math.ceil(cursor.x), Math.ceil(cursor.y), cursor.z, 50);

    //write block to init to a file
    const fs = require('fs');
    fs.writeFileSync("blockToInit.json", JSON.stringify(this.blockToInit, null, 2));

    console.log("blockToInit", cursor, this.blockToInit.length);
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

  update(players, seconds) {
    super.update(players, seconds);

    if (this.blockToInit.length > 0) {
      const block = this.blockToInit.shift();
      this.loadBlock(block.x, block.y, block.z, true);
      //this.blockToInit = [];
    }
  }

  async loadBlock(x, y, z, forceReload = false) {
    await this.ready();
    const params = { minX: x, minY: y, minZ: z, maxX: x + 1, maxY: y + 1, maxZ: z+1, forceReload };
    try {
      let res = await this.client.request("GetBlockList", params);
      // console.log("block loaded", x, y, z, res);
      for (let block of res.mapBlocks || []) {
        if (block.tiles) {
          this._processDfBlocks(block);
          console.log("invalidate chunk", this._listChunksInBlock(x, y, z));
          for(let chunk of this._listChunksInBlock(x, y, z)){
            this.removePreparedChunk(chunk);
          }
        }
       
        //this._processDfBlocksForDynamic(block, this.currentTick);
      }
      // if(res.mapBlocks.length > 0){
      //   const buildingList = res.mapBlocks[0].buildings || [];
      //   for (let building of buildingList) {
      //     if (building.buildingType) {
      //       this.buildingMap(building);
      //     }
      //   }
      // }
    } catch (e) {
      console.error("error loading block", x, y, z, e);
    }
  }

  _listChunksInBlock(blockX, blockY, blockZ) {
    const chunks = [];

    const minX = blockX * this.BLOCK_SIZE;
    const minY = blockY * this.BLOCK_SIZE;
    const minZ = blockZ * this.BLOCK_SIZE_Z;

    const maxX = minX + this.BLOCK_SIZE;
    const maxY = minY + this.BLOCK_SIZE;
    const maxZ = minZ + this.BLOCK_SIZE_Z;

    //check in which chunks each corner of the block is
    const minChunkX = Math.floor(minX / this.CHUNK_SIZE);
    const minChunkY = Math.floor(minY / this.CHUNK_SIZE);
    const minChunkZ = Math.floor(minZ / this.CHUNK_SIZE);

    const maxChunkX = Math.floor(maxX / this.CHUNK_SIZE);
    const maxChunkY = Math.floor(maxY / this.CHUNK_SIZE);
    const maxChunkZ = Math.floor(maxZ / this.CHUNK_SIZE);

    for (let x = minChunkX; x <= maxChunkX; x++) {
      for (let y = minChunkY; y <= maxChunkY; y++) {
        for (let z = minChunkZ; z <= maxChunkZ; z++) {
          chunks.push(`${x},${y},${z}`);
        }
      }
    }

    return chunks;
  }

  _generateSpiralBlocksToLoad3D(centerX, centerY, centerZ, radius) {
    const blocksToLoad = [];
    const blockSize = 16;
  
    // Fonction pour vérifier si un bloc est dans les limites de la carte
    const isInBounds = (bx, by, bz) => {
      return bx >= 0 && bx < Math.ceil(this.mapInfos.size.x / this.BLOCK_SIZE) &&
             by >= 0 && by < Math.ceil(this.mapInfos.size.y / this.BLOCK_SIZE) &&
             bz >= 0 && bz < Math.ceil(this.mapInfos.size.z / this.BLOCK_SIZE_Z);
    };
  
    // Ajouter le bloc central
    const centerBlockX = Math.floor(centerX / this.BLOCK_SIZE);
    const centerBlockY = Math.floor(centerY / this.BLOCK_SIZE);
    const centerBlockZ = Math.floor(centerZ / this.BLOCK_SIZE_Z);
    if (isInBounds(centerBlockX, centerBlockY, centerBlockZ)) {
      blocksToLoad.push({ x: centerBlockX, y: centerBlockY, z: centerBlockZ });
    }
  
    // Générer la spirale 3D
    for (let r = 1; r <= radius; r++) {
      for (let phi = 0; phi < 2 * Math.PI; phi += Math.PI / 8) {
        for (let theta = 0; theta < Math.PI; theta += Math.PI / 8) {
          const x = Math.round(r * Math.sin(theta) * Math.cos(phi));
          const y = Math.round(r * Math.sin(theta) * Math.sin(phi));
          const z = Math.round(r * Math.cos(theta));
  
          const blockX = Math.floor((centerX + x * this.BLOCK_SIZE) / this.BLOCK_SIZE);
          const blockY = Math.floor((centerY + y * this.BLOCK_SIZE) / this.BLOCK_SIZE);
          const blockZ = Math.floor((centerZ + z * this.BLOCK_SIZE_Z) / this.BLOCK_SIZE_Z);
  
          if (isInBounds(blockX, blockY, blockZ)) {
            const block = { x: blockX, y: blockY, z: blockZ };
            if (!blocksToLoad.some(b => b.x === block.x && b.y === block.y && b.z === block.z)) {
              blocksToLoad.push(block);
            }
          }
        }
      }
    }
  
    return blocksToLoad;
  }

  _getBlockPositionFromPlayerPosition(x, y, z) {
    return {
      x: Math.floor(x / this.BLOCK_SIZE),
      y: Math.floor(y / this.BLOCK_SIZE),
      z: Math.floor(z / this.BLOCK_SIZE_Z)
    }
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
      }
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

  _correspondanceResultToMapInfos(correspondanceResult, posX, posY, posZ, tick, placeableId) {
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
      newPlaceable.id = placeableId ? placeableId : Math.floor(Math.random() * 1000000);
      newPlaceable.x = posX + 0.5;
      newPlaceable.y = posY + 0.5;
      newPlaceable.z = posZ;
      newPlaceable.type = correspondanceResult.placeable;
      newPlaceable.tick = tick;
      this.updatePlaceable(newPlaceable);
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

module.exports = { PermaDfMapLoader };