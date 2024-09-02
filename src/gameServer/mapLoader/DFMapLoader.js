const { DfHackConnection } = require("../../dfHackConnection.js");
const { ObjectPool } = require("../../utils/gcHelpers.js");
const { prepareDefinitions } = require("./definitions/objectDefinition.js");

function isBitOn(number, index) {
  return number & (1 << index) ? 1 : 0;
}

class DFMapLoader {
  BLOCK_SIZE = 16;
  BLOCK_SIZE_Z = 1;

  constructor(params, poolSize = 100) {
    this.params = {
      dfHackConnectionHost: params.dfHackConnectionHost || "127.0.0.1",
      dfHackConnectionPort: params.dfHackConnectionPort || 5000,
    };
    this._newPlaceableList = [];
    this.placeablePool = new ObjectPool(
      () => {
        return {
          id: 0,
          x: 0,
          y: 0,
          z: 0,
          type: 0,
          tick: false,
        };
      },
      poolSize,
      poolSize / 2,
    );

    this.client = new DfHackConnection(this.params.dfHackConnectionHost, this.params.dfHackConnectionPort);
  }

  async initMap(serverMap) {
    this.chunkInterface = serverMap.chunkInterface;

    await this.client.ready;

    await this.client.request("ResetMapHashes");
    this._pauseState = await this.client.request("GetPauseState");

    this.mapInfos = {};

    const dfMapInfos = await this.client.request("GetMapInfo");
    this.mapInfos.size = {
      x: dfMapInfos.blockSizeX * this.BLOCK_SIZE,
      y: dfMapInfos.blockSizeY * this.BLOCK_SIZE,
      z: dfMapInfos.blockSizeZ * this.BLOCK_SIZE_Z,
    };

    this.definitions = prepareDefinitions();

    (this.definitions.rtLayerDefinitions = [
      {
        name: "water",
        tint: [0, 0, 255],
      },
      {
        name: "magma",
        tint: [255, 0, 0],
      },
    ]),
      (this.map = new Array(this.mapInfos.size.z)
        .fill(0)
        .map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0)));
    this.floorTint = new Array(this.mapInfos.size.z)
      .fill(0)
      .map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.wallTint = new Array(this.mapInfos.size.z)
      .fill(0)
      .map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0));
    this.rtLayers = [];
    for (let i = 0; i < this.definitions.rtLayerDefinitions.length; i++) {
      this.rtLayers.push(
        new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y)),
      );
    }
    this.placeables = new Array(this.mapInfos.size.z).fill(0).map(() => false);
    this._infos = new Map();

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
      tintDefinitions: [false],
    };
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
            blue: material.stateColor.blue,
          });
          tintInfos.tintCorrespondances[materialKey] = tintKeys.length - 1;
        } else {
          tintInfos.tintCorrespondances[materialKey] = tintKeys.indexOf(tintKey);
        }
      }
    }

    this.definitions = {
      ...this.definitions,
      ...tintInfos,
    };

    const cursor = await this.getCursorPosition();
    this.mapInfos.start = cursor;

    this.blockToInit = this._generateSimpleBlockListToLoad(Math.ceil(cursor.x), Math.ceil(cursor.y), cursor.z, 50);

    console.log("blockToInit", cursor, this.blockToInit.length);
    return this.mapInfos;
  }

  async getCursorPosition() {
    let viewInfos = await this.client.request("GetViewInfo");
    if (viewInfos.cursorPosX === -30000) {
      return {
        x: viewInfos.viewPosX + viewInfos.viewSizeX / 2,
        y: viewInfos.viewPosY + viewInfos.viewSizeY / 2,
        z: viewInfos.viewPosZ,
      };
    } else {
      return {
        x: viewInfos.cursorPosX + 0.5,
        y: viewInfos.cursorPosY + 0.5,
        z: viewInfos.cursorPosZ,
      };
    }
  }

  async loadBlock(x, y, z, forceReload = false) {
    const params = { minX: x, minY: y, minZ: z, maxX: x + 1, maxY: y + 1, maxZ: z + 1, forceReload };
    try {
      let res = await this.client.request("GetBlockList", params);
      // console.log("block loaded", x, y, z, res);
      for (let block of res.mapBlocks || []) {
        if (block.tiles) {
          this._processDfBlocks(block);
        }

        //this._processDfBlocksForDynamic(block, this.currentTick);
      }
      if (res.mapBlocks.length > 0) {
        const buildingList = res.mapBlocks[0].buildings || [];
        for (let building of buildingList) {
          if (building.buildingType) {
            this.buildingMap(building);
          }
        }
      }
    } catch (e) {
      console.error("error loading block", x, y, z, e);
    }
  }

  _processDfBlocks(block) {
    let basePosition = {
      x: block.mapX,
      y: block.mapY,
      z: block.mapZ,
    };

    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        let index = y * 16 + x;
        this.tileMap(block, index, basePosition, x, y);
      }
    }
  }

  buildingMap(building) {
    let key = `${building.buildingType.buildingType},${building.buildingType.buildingSubtype},${building.buildingType.buildingCustom}`;

    const matKey = `${building.material.matIndex},${building.material.matType}`;
    const matTintType = this.definitions.tintCorrespondances[matKey] || 0;
    const def = this.definitions.buildingCorrespondances[key];

    if (this.definitions.buildingCorrespondances[key]) {
      for (let z = building.posZMin; z <= building.posZMax; z++) {
        for (let x = building.posXMin; x <= building.posXMax; x++) {
          for (let y = building.posYMin; y <= building.posYMax; y++) {
            this._correspondanceResultToMapInfos(def, x, y, z, false, "build-" + building.index);
            if (def.cell) {
              this.wallTint[building.posZMin][y * this.mapInfos.size.x + x] = matTintType;
              this._infos.set(`${x},${y},${z}`, {
                title: `${building.buildingType.buildingType},${building.buildingType.buildingSubtype},${building.buildingType.buildingCustom}`,
                texts: [`${x},${y},${z}`],
              });
            }
            if (def.placeable) {
              this._infos.set("build-" + building.index, {
                title: `${building.buildingType.buildingType},${building.buildingType.buildingSubtype},${building.buildingType.buildingCustom}`,
                texts: [`${x},${y},${z}`, "build-" + building.index],
              });
            }
          }
        }
      }
    }
  }

  tileMap(block, index, basePosition, x, y) {
    let tileType = this.tileTypeList.find((t) => t.id === block.tiles[index]);
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
      this.changeCell(posX, posY, posZ, correspondanceResult.cell);
    }
    if (correspondanceResult.placeable) {
      const newPlaceable = this.placeablePool.getNew();
      newPlaceable.id = placeableId ? placeableId : Math.floor(Math.random() * 1000000);
      newPlaceable.x = posX + 0.5;
      newPlaceable.y = posY + 0.5;
      newPlaceable.z = posZ;
      newPlaceable.type = correspondanceResult.placeable;
      newPlaceable.tick = tick;
      this._newPlaceableList.push(newPlaceable);
    }
  }

  _mapDFTileInfosToCell(shape, material, special) {
    let key = `${shape},${material},${special}`;

    if (this.definitions.tileCorrespondances[key] !== undefined) {
      return this.definitions.tileCorrespondances[key];
    }
    console.log("no correspondance for", key);

    return {
      cell: 1,
    };
  }

  _generateSpiralBlocksToLoad3D(centerX, centerY, centerZ, radius) {
    const blocksToLoad = [];

    // Fonction pour vérifier si un bloc est dans les limites de la carte
    const isInBounds = (bx, by, bz) => {
      return (
        bx >= 0 &&
        bx < Math.ceil(this.mapInfos.size.x / this.BLOCK_SIZE) &&
        by >= 0 &&
        by < Math.ceil(this.mapInfos.size.y / this.BLOCK_SIZE) &&
        bz >= 0 &&
        bz < Math.ceil(this.mapInfos.size.z / this.BLOCK_SIZE_Z)
      );
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
            if (!blocksToLoad.some((b) => b.x === block.x && b.y === block.y && b.z === block.z)) {
              blocksToLoad.push(block);
            }
          }
        }
      }
    }

    return blocksToLoad;
  }

  _generateSimpleBlockListToLoad() {
    const blocksToLoad = [];

    for (let x = 0; x < Math.ceil(this.mapInfos.size.x / this.BLOCK_SIZE); x++) {
      for (let y = 0; y < Math.ceil(this.mapInfos.size.y / this.BLOCK_SIZE); y++) {
        for (let z = 0; z < Math.ceil(this.mapInfos.size.z / this.BLOCK_SIZE_Z); z++) {
          blocksToLoad.push({ x, y, z });
        }
      }
    }

    return blocksToLoad;
  }

  async _togglePauser(){
    this._pauseState["Value"] = this._pauseState["Value"] === false ? true : false;
    await this.client.request("SetPauseState", this._pauseState);
    console.log("pause state toggled", this._pauseState["Value"]);
  }

  playerUpdate(player, delta) {

    const block = this._getBlockPositionFromPlayerPosition(player.x, player.y, player.z);
    //load all blocks around the player
    // this.loadBlock(block.x, block.y, block.z-2);
    // this.loadBlock(block.x, block.y, block.z-1);
    this.loadBlock(block.x, block.y, block.z);
    // this.loadBlock(block.x, block.y, block.z+1);
    // this.loadBlock(block.x, block.y, block.z+2);
    //consume orders on player
    for (let order of player.orders) {
      console.log("order", order);
      if (order === "togglePause") {
        this._togglePauser();
      }
    }
  }

  _getBlockPositionFromPlayerPosition(x, y, z) {
    return {
      x: Math.floor(x / this.BLOCK_SIZE),
      y: Math.floor(y / this.BLOCK_SIZE),
      z: Math.floor(z / this.BLOCK_SIZE_Z),
    };
  }

  update(delta) {
    if (this.blockToInit.length > 0) {
      const block = this.blockToInit.shift();
      //this.loadBlock(block.x, block.y, block.z, true);
      console.log("block loaded", block.x, block.y, block.z, this.blockToInit.length);
      //this.blockToInit = [];
    }
    
    //this.loadUnit();
    const tmpPlaceableList = this._newPlaceableList;
    this._newPlaceableList = [];
    return tmpPlaceableList;
  }

  async loadUnit() {
    let creatureList = await this.client.request("GetUnitList");
    for (let crea of creatureList.creatureList || []) {
      this.creatureMap(crea);
    }
  }

  _processDfBlocksForDynamic(block) {
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
      this.flowMap(flow);
    }
    for (let item of block.items || []) {
      this.itemMap(item);
    }
  }

  itemMap(item) {
    if (!item.pos) {
      return;
    }
    let key = `${item.type.matType},-1`;
    if (this.definitions.itemCorrespondances[key]) {
      this._correspondanceResultToMapInfos(
        this.definitions.itemCorrespondances[key],
        item.pos.x,
        item.pos.y,
        item.pos.z,
        this.currentTick,
        item.id,
      );
    }
  }

  flowMap(flow) {
    if (flow.density > 66) {
      this._correspondanceResultToMapInfos(
        this.definitions.flowCorrespondances[flow.type + "-heavy"],
        flow.pos.x,
        flow.pos.y,
        flow.pos.z,
        this.currentTick,
        flow.id,
      );
    } else if (flow.density > 33) {
      this._correspondanceResultToMapInfos(
        this.definitions.flowCorrespondances[flow.type + "-medium"],
        flow.pos.x,
        flow.pos.y,
        flow.pos.z,
        this.currentTick,
        flow.id,
      );
    } else if (flow.density > 0) {
      this._correspondanceResultToMapInfos(
        this.definitions.flowCorrespondances[flow.type + "-light"],
        flow.pos.x,
        flow.pos.y,
        flow.pos.z,
        this.currentTick,
        flow.id,
      );
    }
  }

  creatureMap(unit) {
    if (
      unit.posZ === -30000 ||
      !unit.flags1 ||
      isBitOn(unit.flags1, 1) ||
      isBitOn(unit.flags1, 8) ||
      isBitOn(unit.flags1, 7) ||
      isBitOn(unit.flags1, 25)
    ) {
      return;
    }
    let key = `${unit.race.matType},${unit.race.matIndex}`;
    if (this.definitions.creatureCorrespondances[key]) {
      this._correspondanceResultToMapInfos(
        this.definitions.creatureCorrespondances[key],
        unit.posX,
        unit.posY,
        unit.posZ,
        false,
        "crea-" + unit.id,
      );
      this._infos.set("crea-" + unit.id, {
        title: unit.name,
        texts: unit.isSoldier ? ["soldier"] : [],
      });
    }
  }

  changeCell(x, y, z, value, floorTint, wallTint) {
    const oldVal = this.map[z][y * this.mapInfos.size.x + x];
    this.map[z][y * this.mapInfos.size.x + x] = value;
    if (floorTint) {
      this.floorTint[z][y * this.mapInfos.size.x + x] = floorTint;
    }
    if (wallTint) {
      this.wallTint[z][y * this.mapInfos.size.x + x] = wallTint;
    }
    if(oldVal !== value){
      this.chunkInterface.notifyCellModification(x, y, z);
    }
  }
}

module.exports = DFMapLoader;
