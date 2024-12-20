const { DfHackConnection } = require("../../dfHackConnection.js");
const { ObjectPool } = require("../../utils/gcHelpers.js");
const { generateRandomId } = require("../../utils/helpers.js");
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
    // this.placeablePool = new ObjectPool(
    //   () => {
    //     return {
    //       id: 0,
    //       x: 0,
    //       y: 0,
    //       z: 0,
    //       type: 0,
    //       tick: false,
    //     };
    //   },
    //   poolSize,
    //   poolSize / 2,
    // );

    this.client = new DfHackConnection(this.params.dfHackConnectionHost, this.params.dfHackConnectionPort);
  }

  async initMap(serverMap) {
    this.preparationInterface = serverMap.preparationInterface;

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

    console.log("mapInfos", dfMapInfos);

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
        new Array(this.mapInfos.size.z).fill(0).map(() => new Uint8Array(this.mapInfos.size.x * this.mapInfos.size.y).fill(0)),
      );
    }
    this.placeables = [];
    this.permaEntity = {};
    this._infos = new Map();

    const tileTypeList = await this.client.request("GetTiletypeList");

    this.tileTypeList = tileTypeList.tiletypeList;

    const buildingList = await this.client.request("GetBuildingDefList");
    this.buildingList = buildingList.buildingList;
    this.preparedBuildingList = new Map();
    for (let building of this.buildingList) {
      const buildingKey = `${building.buildingType.buildingType},${building.buildingType.buildingSubtype},${building.buildingType.buildingCustom}`;
      this.preparedBuildingList.set(buildingKey, building);
    }

    const itemList = await this.client.request("GetItemList");
    this.itemList = itemList.materialList;
    this.preparedItemList = new Map();
    for (let item of this.itemList) {
      const itemKey = `${item.matPair.matIndex},${item.matPair.matType}`;
      this.preparedItemList.set(itemKey, item);
    }


    const materialList = await this.client.request("GetMaterialList");
    this.materialList = materialList.materialList;
    this.preparedMaterialList = new Map();
    this.preparedMaterialList.set("-1,-1", { name: "No material" });
    const tintKeys = [""];
    const tintInfos = {
      tintCorrespondances: {},
      tintDefinitions: [false],
    };
    for (let material of this.materialList) {
      const materialKey = `${material.matPair.matIndex},${material.matPair.matType}`;
      if (materialKey === "37,616") {
        console.log("material", material);
      }
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
    this.totalBlockToInit = this.blockToInit.length;

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

  async updateCursorPosition() {
    const cursor = await this.getCursorPosition();
    this.mapInfos.start = cursor;
  }

  async teleportToCursor(player) {
    await this.updateCursorPosition();
    player.x = this.mapInfos.start.x;
    player.y = this.mapInfos.start.y;
    player.z = this.mapInfos.start.z;
  }

  async loadBlock(x, y, z, forceReload = false) {
    const params = { minX: x - 1, minY: y - 1, minZ: z - 1, maxX: x + 2, maxY: y + 2, maxZ: z + 2, forceReload };
    try {
      let res = await this.client.request("GetBlockList", params);
      // console.log("block loaded", x, y, z, res);
      for (let block of res.mapBlocks || []) {
        if (block.tiles) {
          this._processDfBlocks(block);
        }

        this._processDfBlocksForDynamic(block, this.currentTick);
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

    const materialName = this.preparedMaterialList.get(matKey).name;
    const buildingName = this.preparedBuildingList.get(key).name;

    if (this.definitions.buildingCorrespondances[key]) {
      

      if (def.cell) {
        for (let z = building.posZMin; z <= building.posZMax; z++) {
          for (let x = building.posXMin; x <= building.posXMax; x++) {
            for (let y = building.posYMin; y <= building.posYMax; y++) {
              this._cellCorrespondanceToMapInfos(def.cell, x, y, z, {
                title: `${buildingName}`,
                texts: [`${x},${y},${z}`, "Material : -" + materialName],
              }, matTintType);
            }
          }
        }
      }
      if (def.placeable) {
        const medianX = Math.floor((building.posXMin + building.posXMax) / 2);
        const medianY = Math.floor((building.posYMin + building.posYMax) / 2);
        const medianZ = Math.floor((building.posZMin + building.posZMax) / 2);
        this._entityCorrespondanceToPlaceable(
          def.placeable,
          medianX + 0.5,
          medianY + 0.5,
          medianZ,
          "build-" + building.index,
          {
            title: `${buildingName}`,
            texts: [`${medianX},${medianY},${medianZ}`, "Material : -" + materialName],
          },
          false,
        )

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

    this._cellCorrespondanceToMapInfos(corres.cell, basePosition.x + x, basePosition.y + y, basePosition.z, undefined, matTintType, matTintType);
  }

  _cellCorrespondanceToMapInfos(cellCorres, posX, posY, posZ, infos, wallTint, floorTint) {
    this.changeCell(posX, posY, posZ, cellCorres, wallTint, floorTint);
    if (infos) {
      this._infos.set(`${posX},${posY},${posZ}`, infos);
    } else {
      this._infos.delete(`${posX},${posY},${posZ}`)
    }
  }

  _entityCorrespondanceToPlaceable(correspondanceResult, posX, posY, posZ, placeableId, infos, toRemove) {

    if (!toRemove && this.permaEntity[placeableId]) {
      this.permaEntity[placeableId].x = posX;
      this.permaEntity[placeableId].y = posY;
      this.permaEntity[placeableId].z = posZ;
    } else {
      const newPlaceable = {
        id: placeableId ? placeableId : generateRandomId(),
        x: posX,
        y: posY,
        z: posZ,
        type: correspondanceResult,
        toRemove: toRemove,
      };
      this.placeables.push(newPlaceable);
      if (placeableId) {
        this.permaEntity[placeableId] = newPlaceable;
      }
    }
    if (infos) {
      this._infos.set(placeableId, infos)
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

  _generateSimpleBlockListToLoad() {
    const blocksToLoad = [];

    for (let x = 1; x < Math.ceil(this.mapInfos.size.x / this.BLOCK_SIZE); x += 3) {
      for (let y = 1; y < Math.ceil(this.mapInfos.size.y / this.BLOCK_SIZE); y += 3) {
        for (let z = 1; z < Math.ceil(this.mapInfos.size.z / this.BLOCK_SIZE_Z); z += 3) {
          blocksToLoad.push({ x, y, z });
        }
      }
    }

    return blocksToLoad;
  }

  async _togglePause() {
    this._pauseState["Value"] = this._pauseState["Value"] === false ? true : false;
    await this.client.request("SetPauseState", this._pauseState);
    console.log("pause state toggled", this._pauseState["Value"]);
  }

  playerUpdate(player, delta) {

    const playerSprite = player.updateSpriteAndReturn();

    if (!this.permaEntity[playerSprite.id]) {
      this.permaEntity[playerSprite.id] = playerSprite;
      this.placeables.push(playerSprite);
      this._infos.set(playerSprite.id, {
        title: "player",
        texts: [playerSprite.id],
      })
    }

    const block = this._getBlockPositionFromPlayerPosition(player.x, player.y, player.z);

    this.loadBlock(block.x, block.y, block.z);

    //consume orders on player
    for (let order of player.orders) {
      console.log("order", order);
      if (order === "togglePause") {
        this._togglePause();
      }
      if (order === "teleportToCursor") {
        this.teleportToCursor(player);
      }
    }
    this.preparationInterface.notifyZlevelModification(player.z);
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
      this.loadBlock(block.x, block.y, block.z, true);
      //this.blockToInit = [];
    }

    this.loadUnit();

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
          this.rtLayers[0][block.mapZ][(block.mapY + y) * this.mapInfos.size.x + (block.mapX + x)] = block.water[index];
        }
      }
    }
    if (block.magma) {
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          let index = y * 16 + x;
          this.rtLayers[1][block.mapZ][(block.mapY + y) * this.mapInfos.size.x + (block.mapX + x)] = block.magma[index];
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
    const key = `${item.type.matType},-1`;
    const materialKey = `${item.material.matIndex},${item.material.matType}`;
    const itemKey = `${item.type.matIndex},${item.type.matType}`;

    const materialName = (this.preparedMaterialList.get(materialKey) || {}).name;
    const itemDef = (this.preparedItemList.get(itemKey) || {});

    if (this.definitions.itemCorrespondances[key]) {
      this._entityCorrespondanceToPlaceable(
        this.definitions.itemCorrespondances[key].placeable,
        item.pos.x + 0.5,
        item.pos.y + 0.5,
        item.pos.z,
        item.id,
        {
          title: itemDef.name ? itemDef.name : itemDef.id,
          texts: ["material : " + materialName, "stack : " + item.stackSize, "improvements : " + !!item.improvements],

        },
      );
    }
  }

  flowMap(flow) {

    if (flow.density > 66) {
      this._entityCorrespondanceToPlaceable(
        this.definitions.flowCorrespondances[flow.type + "-heavy"].placeable,
        flow.pos.x + 0.5,
        flow.pos.y + 0.5,
        flow.pos.z,
        undefined,
        undefined,
        true,
      );
    } else if (flow.density > 33) {
      this._entityCorrespondanceToPlaceable(
        this.definitions.flowCorrespondances[flow.type + "-medium"].placeable,
        flow.pos.x + 0.5,
        flow.pos.y + 0.5,
        flow.pos.z,
        undefined,
        undefined,
        true,
      );
    } else if (flow.density > 0) {
      this._entityCorrespondanceToPlaceable(
        this.definitions.flowCorrespondances[flow.type + "-light"].placeable,
        flow.pos.x + 0.5,
        flow.pos.y + 0.5,
        flow.pos.z,
        undefined,
        undefined,
        true,
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
      this._entityCorrespondanceToPlaceable(
        this.definitions.creatureCorrespondances[key].placeable,
        unit.posX + 0.5,
        unit.posY + 0.5,
        unit.posZ,
        "crea-" + unit.id,
        {
          title: unit.name,
          texts: unit.isSoldier ? ["soldier"] : [],
        },
        false,
      );
    }
  }

  changeCell(x, y, z, value, wallTint, floorTint) {
    const oldVal = this.map[z][y * this.mapInfos.size.x + x];
    this.map[z][y * this.mapInfos.size.x + x] = value;
    if (floorTint) {
      this.floorTint[z][y * this.mapInfos.size.x + x] = floorTint;
    }
    if (wallTint) {
      this.wallTint[z][y * this.mapInfos.size.x + x] = wallTint;
    }
    if (oldVal !== value) {
      this.preparationInterface.notifyCellModification(x, y, z);
    }
  }
}

module.exports = DFMapLoader;
