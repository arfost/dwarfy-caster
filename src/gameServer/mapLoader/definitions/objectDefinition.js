const materialTileType = {
  NO_MATERIAL: -1,
  AIR: 0,
  SOIL: 1,
  STONE: 2,
  FEATURE: 3,
  LAVA_STONE: 4,
  MINERAL: 5,
  FROZEN_LIQUID: 6,
  CONSTRUCTION: 7,
  GRASS_LIGHT: 8,
  GRASS_DARK: 9,
  GRASS_DRY: 10,
  GRASS_DEAD: 11,
  PLANT: 12,
  HFS: 13,
  CAMPFIRE: 14,
  FIRE: 15,
  ASHES: 16,
  MAGMA: 17,
  DRIFTWOOD: 18,
  POOL: 19,
  BROOK: 20,
  RIVER: 21,
  ROOT: 22,
  TREE_MATERIAL: 23,
  MUSHROOM: 24,
  UNDERWORLD_GATE: 25,
};

const specialTileType = {
  NO_SPECIAL: -1,
  NORMAL: 0,
  RIVER_SOURCE: 1,
  WATERFALL: 2,
  SMOOTH: 3,
  FURROWED: 4,
  WET: 5,
  DEAD: 6,
  WORN_1: 7,
  WORN_2: 8,
  WORN_3: 9,
  TRACK: 10,
  SMOOTH_DEAD: 11,
};

const shapeTileType = {
  NO_SHAPE: -1,
  EMPTY: 0,
  FLOOR: 1,
  BOULDER: 2,
  PEBBLES: 3,
  WALL: 4,
  FORTIFICATION: 5,
  STAIR_UP: 6,
  STAIR_DOWN: 7,
  STAIR_UPDOWN: 8,
  RAMP: 9,
  RAMP_TOP: 10,
  BROOK_BED: 11,
  BROOK_TOP: 12,
  TREE_SHAPE: 13,
  SAPLING: 14,
  SHRUB: 15,
  ENDLESS_PIT: 16,
  BRANCH: 17,
  TRUNK_BRANCH: 18,
  TWIG: 19,
};

function getTileCode(tileSignature) {
  const [shape, material, special] = tileSignature.split("-");
  return `${shapeTileType[shape]},${materialTileType[material]},${specialTileType[special]}`;
}

//load combinaisons from JSON files
const tileCombinaisons = require("./tileCombinaisons.json");
const buildingCombinaisons = require("./buildingCombinaisons.json");
const flowCombinaisons = require("./flowCombinaisons.json");
const creatureCombinaisons = require("./creatureCombinaisons.json");
const itemCombinaisons = require("./itemCombinaisons.json");

function prepareDefinitions() {
  const assetNames = {
    textures: [],
    sprites: [],
  };

  const cellDefinitions = [
    undefined,
    {
      heightRatio: 1,
      wallTexture: "wall_error",
      floorTexture: "floor_error",
      stopView: true,
    },
  ];
  const placeableDefinitions = [
    {
      heightRatio: 1,
    },
    {
      heightRatio: 1,
      sprite: "PLAYER"
    },
  ];

  const tileCorrespondances = {};
  for (let base of tileCombinaisons) {
    let correspondance = {};
    if (base.cell) {
      const baseCell = {
        ...base.cell,
      };
      cellDefinitions.push(baseCell);
      correspondance.cell = cellDefinitions.length - 1;
    }
    if (base.cell === 0) {
      correspondance.cell = 0;
    }
    if (base.placeable) {
      const baseSprite = {
        ...base.placeable,
      };
      placeableDefinitions.push(baseSprite);
      correspondance.placeable = placeableDefinitions.length - 1;
    }
    for (let signature of base.signature) {
      tileCorrespondances[getTileCode(signature)] = correspondance;
    }
    for (let variant of base.variants || []) {
      let correspondance = {};
      if (base.cell) {
        const baseCell = {
          ...base.cell,
          ...(variant.cell || {}),
        };
        cellDefinitions.push(baseCell);
        correspondance.cell = cellDefinitions.length - 1;
      }
      if (base.placeable) {
        const baseSprite = {
          ...base.placeable,
          ...(variant.placeable || {}),
        };
        placeableDefinitions.push(baseSprite);
        correspondance.placeable = placeableDefinitions.length - 1;
      }
      for (let signature of variant.signature) {
        tileCorrespondances[getTileCode(signature)] = correspondance;
      }
    }
  }

  //prepare building definitions
  const buildingCorrespondances = {};
  for (let base of buildingCombinaisons) {
    let correspondance = {};
    if (base.placeable) {
      const basePlaceable = {
        ...base.placeable,
      };
      placeableDefinitions.push(basePlaceable);
      correspondance.placeable = placeableDefinitions.length - 1;
    }
    if (base.cell) {
      const baseCell = {
        ...base.cell,
      };
      cellDefinitions.push(baseCell);
      correspondance.cell = cellDefinitions.length - 1;
    }
    for (let signature of base.signature) {
      buildingCorrespondances[signature] = correspondance;
    }
  }

  // prepare flow definitions
  const flowCorrespondances = {};
  for (let base of flowCombinaisons) {
    let correspondance = {};
    if (base.placeable) {
      const basePlaceable = {
        ...base.placeable,
      };
      placeableDefinitions.push(basePlaceable);
      correspondance.placeable = placeableDefinitions.length - 1;
    }
    if (base.cell) {
      const baseCell = {
        ...base.cell,
      };
      cellDefinitions.push(baseCell);
      correspondance.cell = cellDefinitions.length - 1;
    }
    for (let signature of base.signature) {
      flowCorrespondances[signature] = correspondance;
    }
  }

  //prepare creature definitions
  const creatureCorrespondances = {};
  for (let base of creatureCombinaisons) {
    let correspondance = {};
    if (base.placeable) {
      const basePlaceable = {
        ...base.placeable,
      };
      placeableDefinitions.push(basePlaceable);
      correspondance.placeable = placeableDefinitions.length - 1;
    }
    if (base.cell) {
      const baseCell = {
        ...base.cell,
      };
      cellDefinitions.push(baseCell);
      correspondance.cell = cellDefinitions.length - 1;
    }
    for (let signature of base.signature) {
      creatureCorrespondances[signature] = correspondance;
    }
  }

  //prepare item definitions
  const itemCorrespondances = {};
  for (let base of itemCombinaisons) {
    let correspondance = {};
    if (base.placeable) {
      const basePlaceable = {
        ...base.placeable,
      };
      placeableDefinitions.push(basePlaceable);
      correspondance.placeable = placeableDefinitions.length - 1;
    }
    if (base.cell) {
      const baseCell = {
        ...base.cell,
      };
      cellDefinitions.push(baseCell);
      correspondance.cell = cellDefinitions.length - 1;
    }
    for (let signature of base.signature) {
      itemCorrespondances[signature] = correspondance;
    }
  }

  for (let definition of cellDefinitions) {
    if (definition) {
      if (definition.wallTexture) {
        definition.wallTexture = definition.wallTexture.toUpperCase();
        if (!assetNames.textures.includes(definition.wallTexture)) {
          assetNames.textures.push(definition.wallTexture);
        }
      }
      if (definition.floorTexture) {
        definition.floorTexture = definition.floorTexture.toUpperCase();
        if (!assetNames.textures.includes(definition.floorTexture)) {
          assetNames.textures.push(definition.floorTexture);
        }
      }
    }
  }

  for (let definition of placeableDefinitions) {
    if (definition && definition.sprite) {
      definition.sprite = definition.sprite.toUpperCase();
      if (!assetNames.sprites.some((name) => name === definition.sprite)) {
        assetNames.sprites.push(definition.sprite);
      }
    }
  }

  return {
    cellDefinitions,
    placeableDefinitions,
    flowCorrespondances,
    tileCorrespondances,
    buildingCorrespondances,
    creatureCorrespondances,
    itemCorrespondances,
    assetNames,
  };
}

module.exports = {
  prepareDefinitions,
};
