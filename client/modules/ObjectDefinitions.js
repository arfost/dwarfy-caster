const materialTileType = {
  "NO_MATERIAL": -1,
  "AIR": 0,
  "SOIL": 1,
  "STONE": 2,
  "FEATURE": 3,
  "LAVA_STONE": 4,
  "MINERAL": 5,
  "FROZEN_LIQUID": 6,
  "CONSTRUCTION": 7,
  "GRASS_LIGHT": 8,
  "GRASS_DARK": 9,
  "GRASS_DRY": 10,
  "GRASS_DEAD": 11,
  "PLANT": 12,
  "HFS": 13,
  "CAMPFIRE": 14,
  "FIRE": 15,
  "ASHES": 16,
  "MAGMA": 17,
  "DRIFTWOOD": 18,
  "POOL": 19,
  "BROOK": 20,
  "RIVER": 21,
  "ROOT": 22,
  "TREE_MATERIAL": 23,
  "MUSHROOM": 24,
  "UNDERWORLD_GATE": 25
}

const specialTileType = {
  "NO_SPECIAL": -1,
  "NORMAL": 0,
  "RIVER_SOURCE": 1,
  "WATERFALL": 2,
  "SMOOTH": 3,
  "FURROWED": 4,
  "WET": 5,
  "DEAD": 6,
  "WORN_1": 7,
  "WORN_2": 8,
  "WORN_3": 9,
  "TRACK": 10,
  "SMOOTH_DEAD": 11
}

const shapeTileType = {
  "NO_SHAPE": -1,
  "EMPTY": 0,
  "FLOOR": 1,
  "BOULDER": 2,
  "PEBBLES": 3,
  "WALL": 4,
  "FORTIFICATION": 5,
  "STAIR_UP": 6,
  "STAIR_DOWN": 7,
  "STAIR_UPDOWN": 8,
  "RAMP": 9,
  "RAMP_TOP": 10,
  "BROOK_BED": 11,
  "BROOK_TOP": 12,
  "TREE_SHAPE": 13,
  "SAPLING": 14,
  "SHRUB": 15,
  "ENDLESS_PIT": 16,
  "BRANCH": 17,
  "TRUNK_BRANCH": 18,
  "TWIG": 19
}

function getTileCode(tileSignature){
  const [shape, material, special] = tileSignature.split("-");
  return `${shapeTileType[shape]},${materialTileType[material]},${specialTileType[special]}`;
}

const empty = {
  cell:0,
  signature:[
    "EMPTY-AIR-NO_SPECIAL",
    "EMPTY-HFS-NO_SPECIAL",
    "NO_SHAPE-NO_MATERIAL-NO_SPECIAL",
    "RAMP_TOP-AIR-NO_SPECIAL",
  ]
}

const sapling = {
  cell:{
    heightRatio: 0.3,
    floorTexture: "sapling_floor", // sol, terre/herbe
    wallTexture: "sapling_wall", // branchage partiellement transparent
  },
  signature:[
    "SAPLING-PLANT-DEAD",
    "SAPLING-PLANT-NORMAL",
  ]
}

const shrub = {
  cell:{
    heightRatio: 0.5,
    floorTexture: "shrub_floor", // sol, terre/herbe
    wallTexture: "shrub_wall", // branchage partiellement transparent
  },
  signature:[
    "SHRUB-PLANT-DEAD",
    "SHRUB-PLANT-NORMAL",
  ]
}

const stair = {
  cell:{
    heightRatio: 0.5,
    floorTexture: "stairs_floor_neutral", // neutre escalier symbol
    wallTexture: "stairs_wall_neutral", // neutre escalier symbol
  },
  variants:[
    {
      cell:{
        floorTexture: "stairs_floor_construction", // briques escalier symbol
        wallTexture: "stairs_wall_construction", // briques escalier symbol
      },
      signature:[
        "STAIR_DOWN-CONSTRUCTION-NO_SPECIAL",
        "STAIR_UP-CONSTRUCTION-NO_SPECIAL",
        "STAIR_UPDOWN-CONSTRUCTION-NO_SPECIAL",
      ]
    },
    {
      cell:{
        floorTexture: "stairs_floor_grass", // sol, terre/herbe
        wallTexture: "stairs_wall_grass", 
      },
      signature:[
        "STAIR_DOWN-GRASS_DARK-NO_SPECIAL",
        "STAIR_DOWN-GRASS_LIGHT-NO_SPECIAL",
        "STAIR_UP-GRASS_DARK-NO_SPECIAL",
        "STAIR_UP-GRASS_LIGHT-NO_SPECIAL",
        "STAIR_UPDOWN-GRASS_DARK-NO_SPECIAL",
        "STAIR_UPDOWN-GRASS_LIGHT-NO_SPECIAL",
      ]
    },{
      cell:{
        floorTexture: "stairs_floor_stone", // neutre escalier symbol
        wallTexture: "stairs_wall_stone", // neutre escalier symbol
      },
      signature:[
        "STAIR_DOWN-STONE-NO_SPECIAL",
        "STAIR_UP-STONE-NO_SPECIAL",
        "STAIR_UPDOWN-STONE-NO_SPECIAL",
      ]
    },{
      cell:{
        floorTexture: "stairs_floor_soil", // neutre escalier symbol
        wallTexture: "stairs_wall_soil", // neutre escalier symbol
      },
      signature:[
        "STAIR_UP-SOIL-NO_SPECIAL",
        "STAIR_DOWN-SOIL-NO_SPECIAL",
        "STAIR_UPDOWN-SOIL-NO_SPECIAL",
      ]
    },{
      cell:{
        floorTexture: "stairs_floor_mineral", // neutre escalier symbol
        wallTexture: "stairs_wall_mineral", // neutre escalier symbol
      },
      signature:[
        "STAIR_DOWN-MINERAL-NO_SPECIAL",
        "STAIR_UP-MINERAL-NO_SPECIAL",
        "STAIR_UPDOWN-MINERAL-NO_SPECIAL",
      ]
    }
  ],
  signature:[
    "STAIR_DOWN-UNDERWORLD_GATE-NO_SPECIAL", 
    "STAIR_UP-UNDERWORLD_GATE-NO_SPECIAL",
    "STAIR_UPDOWN-UNDERWORLD_GATE-NO_SPECIAL",
    "STAIR_DOWN-FEATURE-NO_SPECIAL",
    "STAIR_UP-FEATURE-NO_SPECIAL",
    "STAIR_UPDOWN-FEATURE-NO_SPECIAL",
    "STAIR_DOWN-FROZEN_LIQUID-NO_SPECIAL",
    "STAIR_UP-FROZEN_LIQUID-NO_SPECIAL",
    "STAIR_UPDOWN-FROZEN_LIQUID-NO_SPECIAL",
    "STAIR_DOWN-LAVA_STONE-NO_SPECIAL",
    "STAIR_UP-LAVA_STONE-NO_SPECIAL",
    "STAIR_UPDOWN-LAVA_STONE-NO_SPECIAL",
  ]
}

const trunk_branch = {
  cell:{
    heightRatio: 1,
    floorTexture: "trunk_branch_floor", // grosses branches partiellement transparent
    wallTexture: "trunk_branch_wall", // grosses branches partiellement transparent
  },
  signature:[
    "TRUNK_BRANCH-TREE_MATERIAL-DEAD",
    "TRUNK_BRANCH-TREE_MATERIAL-NO_SPECIAL",
  ]
}

const pebbles = {
  cell:{
    floorTexture: "pebbles_floor", // sol, terre/herbe avec petits cailloux
  },
  signature:[
    "PEBBLES-FEATURE-NO_SPECIAL",
    "PEBBLES-LAVA_STONE-NO_SPECIAL",
    "PEBBLES-MINERAL-NO_SPECIAL",
    "PEBBLES-STONE-NO_SPECIAL",
  ]
}

const ramp = {
  cell:{
    heightRatio: 0.5,
    floorTexture: "ramp_floor_neutral", // sol, terre/herbe
    wallTexture: "ramp_wall_neutral", // branchage partiellement transparent
  },
  variants:[
    {
      cell:{
        floorTexture: "ramp_floor_construction", // briques escalier symbol
        wallTexture: "ramp_wall_construction", // briques escalier symbol
      },
      signature:[
        "RAMP-CONSTRUCTION-NO_SPECIAL",
        "RAMP-CONSTRUCTION-TRACK",
      ]
    },
    {
      cell:{
        floorTexture: "ramp_floor_grass",
        wallTexture: "ramp_wall_grass", 
      },
      signature:[
        "RAMP-GRASS_DARK-NO_SPECIAL",
        "RAMP-GRASS_DEAD-NO_SPECIAL",
        "RAMP-GRASS_DRY-NO_SPECIAL",
        "RAMP-GRASS_LIGHT-NO_SPECIAL",
      ]
    },{
      cell:{
        floorTexture: "ramp_floor_stone", // neutre escalier symbol
        wallTexture: "ramp_wall_stone", // neutre escalier symbol
      },
      signature:[
        "RAMP-STONE-NO_SPECIAL",
        "RAMP-STONE-TRACK",
      ]
    },{
      cell:{
        floorTexture: "ramp_floor_soil", // neutre escalier symbol
        wallTexture: "ramp_wall_soil", // neutre escalier symbol
      },
      signature:[
        "RAMP-SOIL-NO_SPECIAL",
      ]
    },{
      cell:{
        floorTexture: "ramp_floor_mineral", // neutre escalier symbol
        wallTexture: "ramp_wall_mineral", // neutre escalier symbol
      },
      signature:[
        "RAMP-MINERAL-NO_SPECIAL",
        "RAMP-MINERAL-TRACK",
      ]
    },{
      cell:{
        floorTexture: "ramp_floor_wood", // neutre escalier symbol
        wallTexture: "ramp_wall_wood", // neutre escalier symbol
      },
      signature:[
        "RAMP-TREE_MATERIAL-DEAD",
        "RAMP-TREE_MATERIAL-NO_SPECIAL",
      ]
    },{
      cell:{
        floorTexture: "ramp_floor_water", // neutre escalier symbol
        wallTexture: "ramp_wall_water", // neutre escalier symbol
      },
      signature:[
        "RAMP-POOL-NO_SPECIAL",
        "RAMP-RIVER-NO_SPECIAL",
      ]
    }
  ],
  signature:[
    "RAMP-FEATURE-NO_SPECIAL",
    "RAMP-FEATURE-TRACK",
    "RAMP-FIRE-NO_SPECIAL",
    "RAMP-FROZEN_LIQUID-NO_SPECIAL",
    "RAMP-FROZEN_LIQUID-TRACK",
    "RAMP-LAVA_STONE-NO_SPECIAL",
    "RAMP-LAVA_STONE-TRACK",
    "RAMP-MUSHROOM-DEAD",
    "RAMP-MUSHROOM-NO_SPECIAL",
    "RAMP-ROOT-DEAD",
    "RAMP-ROOT-NO_SPECIAL",
  ]
}

const fortification = {
  cell:{
    heightRatio: 1,
    floorTexture: "fortification_floor", // mur de pierre
    wallTexture: "fortification_wall", // mur de pierre
  },
  signature:[
    "FORTIFICATION-CONSTRUCTION-NO_SPECIAL",
    "FORTIFICATION-FEATURE-NO_SPECIAL",
    "FORTIFICATION-FROZEN_LIQUID-NO_SPECIAL",
    "FORTIFICATION-LAVA_STONE-NO_SPECIAL",
    "FORTIFICATION-MINERAL-NO_SPECIAL",
    "FORTIFICATION-STONE-NO_SPECIAL",
  ]
}

const floor = {
  cell:{
    floorTexture: "floor_neutral", // sol, terre/herbe
  },
  variants:[
    {
      cell:{
        floorTexture: "floor_grass", // sol, terre/herbe
      },
      signature:[
        "FLOOR-GRASS_DARK-NO_SPECIAL",
        "FLOOR-GRASS_DEAD-NO_SPECIAL",
        "FLOOR-GRASS_DRY-NO_SPECIAL",
        "FLOOR-GRASS_LIGHT-NO_SPECIAL",
      ]
    },
    {
      cell:{
        floorTexture: "floor_mineral", // sol, terre/herbe
      },
      signature:[
        "FLOOR-MINERAL-NORMAL",
        "FLOOR-MINERAL-SMOOTH",
        "FLOOR-MINERAL-TRACK",
      ]
    },
    {
      cell:{
        floorTexture: "floor_stone", // sol, terre/herbe
      },
      signature:[
        "FLOOR-STONE-NORMAL",
        "FLOOR-STONE-SMOOTH",
        "FLOOR-STONE-TRACK",
      ]
    },
    {
      cell:{
        floorTexture: "floor_soil", // sol, terre/herbe
      },
      signature:[
        "FLOOR-SOIL-FURROWED",
        "FLOOR-SOIL-NORMAL",
        "FLOOR-SOIL-WET",
      ]
    },
    {
      cell:{
        floorTexture: "floor_construction", // sol, terre/herbe
      },
      signature:[
        "FLOOR-CONSTRUCTION-SMOOTH",
        "FLOOR-CONSTRUCTION-TRACK",
      ]
    },
    {
      cell:{
        floorTexture: "floor_water", // sol, terre/herbe
      },
      signature:[
        "FLOOR-RIVER-NORMAL",
        "FLOOR-RIVER-RIVER_SOURCE",
        "FLOOR-RIVER-WATERFALL",
        "BROOK_TOP-BROOK-NO_SPECIAL",
        "FLOOR-POOL-NO_SPECIAL",
      ]
    }
  ],
  signature:[
    "FLOOR-ASHES-NO_SPECIAL",

    "FLOOR-CAMPFIRE-NO_SPECIAL",

    "FLOOR-DRIFTWOOD-NO_SPECIAL",

    "FLOOR-FEATURE-NORMAL",
    "FLOOR-FEATURE-SMOOTH",
    "FLOOR-FEATURE-TRACK",

    "FLOOR-FIRE-NO_SPECIAL",

    "FLOOR-FROZEN_LIQUID-NORMAL",
    "FLOOR-FROZEN_LIQUID-SMOOTH",
    "FLOOR-FROZEN_LIQUID-TRACK",
    
    "FLOOR-HFS-NO_SPECIAL",

    "FLOOR-LAVA_STONE-NORMAL",
    "FLOOR-LAVA_STONE-SMOOTH",
    "FLOOR-LAVA_STONE-TRACK",

    "FLOOR-MAGMA-NO_SPECIAL",
    
    "FLOOR-MUSHROOM-DEAD",
    "FLOOR-MUSHROOM-NO_SPECIAL",
  ]
}

const wall = {
  cell:{
    floorTexture: "wall_floor_neutral", // neutre
    wallTexture: "wall_neutral", // neutre
    heightRatio: 1,
    stopView: true,
  },
  variants:[
    {
      cell:{
        floorTexture: "wall_floor_construction", // neutre
        wallTexture: "wall_construction", // mur de pierre
      },
      signature:[
        "WALL-CONSTRUCTION-SMOOTH",
      ]
    },
    {
      cell:{
        floorTexture: "wall_floor_mineral", // neutre
        wallTexture: "wall_mineral", // mur de pierre
      },
      signature:[
        "WALL-MINERAL-NORMAL",
        "WALL-MINERAL-WORN_1",
        "WALL-MINERAL-WORN_2",
        "WALL-MINERAL-WORN_3",
      ]
    },
    {
      cell:{
        floorTexture: "wall_floor_root", // neutre
        wallTexture: "wall_root", // mur de pierre
      },
      signature:[
        "WALL-ROOT-DEAD",
        "WALL-ROOT-NO_SPECIAL",
      ]
    },
    {
      cell:{
        floorTexture: "wall_floor_stone", // neutre
        wallTexture: "wall_stone", // mur de pierre
      },
      signature:[
        "WALL-STONE-NORMAL",
        "WALL-STONE-WORN_1",
        "WALL-STONE-WORN_2",
        "WALL-STONE-WORN_3",
      ]
    },
    {
      cell:{
        floorTexture: "wall_floor_stone_smooth", // neutre
        wallTexture: "wall_stone_smooth", // mur de pierre
      },
      signature:[
        "WALL-STONE-SMOOTH",
        "WALL-MINERAL-SMOOTH",
      ]
    },
    {
      cell:{
        floorTexture: "wall_floor_soil", // neutre
        wallTexture: "wall_soil", // mur de pierre
      },
      signature:[
        "WALL-SOIL-NO_SPECIAL",
      ]
    },
    {
      cell:{
        floorTexture: "wall_floor_tree", // neutre
        wallTexture: "wall_tree", // mur de pierre
      },
      signature:[
        "WALL-TREE_MATERIAL-DEAD",
        "WALL-TREE_MATERIAL-NO_SPECIAL",
        "WALL-TREE_MATERIAL-SMOOTH",
        "WALL-TREE_MATERIAL-SMOOTH_DEAD"
      ]
    },
    {
      cell:{
        floorTexture: "wall_floor_brook", // neutre
        wallTexture: "wall_brook", // mur de pierre
      },
      signature:[
        "BROOK_BED-BROOK-NO_SPECIAL",
      ]
    },
  ],
  signature:[
    
    "WALL-FEATURE-NORMAL",
    "WALL-FEATURE-SMOOTH",
    "WALL-FEATURE-WORN_1",
    "WALL-FEATURE-WORN_2",
    "WALL-FEATURE-WORN_3",
    "WALL-FIRE-NO_SPECIAL",
    "WALL-FROZEN_LIQUID-NORMAL",
    "WALL-FROZEN_LIQUID-SMOOTH",
    "WALL-FROZEN_LIQUID-WORN_1",
    "WALL-FROZEN_LIQUID-WORN_2",
    "WALL-FROZEN_LIQUID-WORN_3",
    "WALL-HFS-NO_SPECIAL",
    "WALL-LAVA_STONE-NORMAL",
    "WALL-LAVA_STONE-SMOOTH",
    "WALL-LAVA_STONE-WORN_1",
    "WALL-LAVA_STONE-WORN_2",
    "WALL-LAVA_STONE-WORN_3",
    "WALL-MAGMA-NO_SPECIAL",
    
    "WALL-MUSHROOM-DEAD",
    "WALL-MUSHROOM-NO_SPECIAL",
    "WALL-MUSHROOM-SMOOTH",
    "WALL-MUSHROOM-SMOOTH_DEAD",
  ]

}

const branch = {
  cell:{
    heightRatio: 0.5,
    floorTexture: "branch_floor", // branchage partiellement transparent
    wallTexture: "branch_wall", // branchage partiellement transparent
  },
  signature:[
    "BRANCH-FIRE-NO_SPECIAL",
    "BRANCH-TREE_MATERIAL-DEAD",
    "BRANCH-TREE_MATERIAL-NO_SPECIAL",
    "BRANCH-TREE_MATERIAL-SMOOTH",
    "BRANCH-TREE_MATERIAL-SMOOTH_DEAD",
  ]
}

const boulder = {
  cell:{
    floorTexture: "boulder_floor", // herbe avec gros cailloux
  },
  signature:[
    "BOULDER-FEATURE-NO_SPECIAL",
    "BOULDER-LAVA_STONE-NO_SPECIAL",
    "BOULDER-MINERAL-NO_SPECIAL",
    "BOULDER-STONE-NO_SPECIAL",
  ]
}

const twig = {
  cell:{
    heightRatio: 0.3,
    floorTexture: "twig_floor", // sol, terre/herbe
    wallTexture: "twig_wall", // branchage leger partiellement transparent
  },
  signature:[
    "TWIG-FIRE-NO_SPECIAL",
    "TWIG-TREE_MATERIAL-DEAD",
    "TWIG-TREE_MATERIAL-NO_SPECIAL",
  ]
}

const tileCombinaisons = [empty, sapling, shrub, stair, trunk_branch, pebbles, ramp, fortification, floor, wall, branch, boulder, twig];

// Shop = 7,
// Workshop = 13,
// Bridge = 19,
// RoadDirt = 20,
// RoadPaved = 21,
// SiegeEngine = 22,
// Support = 25,
// Stockpile = 29,
// Civzone = 30,
// Weapon = 31,
// ScrewPump = 33,
// Construction = 34,
// Hatch = 35,
// GearAssembly = 40,
// AxleHorizontal = 41,
// AxleVertical = 42,
// WaterWheel = 43,
// Windmill = 44,
// Rollers = 50,

const buildingCombinaisons = [{
  placeable: {
    heightRatio: 1,
    sprite: "workshop",
  },
  signature: [13],
},{
  placeable: {
    heightRatio: 1,
    sprite: "trade_depot",
  },
  signature: [6],
},{
  placeable: {
    heightRatio: 1,
    sprite: "furnace",
  },
  signature: [5],
},{
  cell: {
    floorTexture: "floorbar_default",
  },
  signature: [37, 39],
},{
  cell: {
    floorTexture: "farmplot_default",
  },
  signature: [4],
},{
  cell: {
    heightRatio: 1,
    thinWall: true,
    wallTexture: "window_default",
    floorTexture: "floor_neutral",
  },
  signature: [16, 17],
},{
  cell: {
    heightRatio: 1,
    thinWall: true,
    wallTexture: "floodgate_default",
    floorTexture: "floor_neutral",
  },
  signature: [9],
},{
  placeable: {
    heightRatio: 1,
    sprite: "bookcase",
  },
  signature: [52],
},{
  placeable: {
    heightRatio: 1,
    sprite: "instrument",
  },
  signature: [51],
},{
  placeable: {
    heightRatio: 1,
    sprite: "hive",
  },
  signature: [49],
},{
  placeable: {
    heightRatio: 1,
    sprite: "nestbox",
  },
  signature: [48],
},{
  placeable: {
    heightRatio: 1,
    sprite: "nest",
  },
  signature: [47],
},{
  placeable: {
    heightRatio: 1,
    sprite: "slab",
  },
  signature: [46],
},{
  placeable: {
    heightRatio: 1,
    sprite: "tractionbench",
  },
  signature: [45],
},{
  placeable: {
    heightRatio: 1,
    sprite: "wagon",
  },
  signature: [32],
},{
  placeable: {
    heightRatio: 1,
    sprite: "cage",
  },
  signature: [28],
},{
  placeable: {
    heightRatio: 1,
    sprite: "chain",
  },
  signature: [27],
},{
  placeable: {
    heightRatio: 1,
    sprite: "animaltrap",
  },
  signature: [24],
},{
  placeable: {
    heightRatio: 1,
    sprite: "archerytarget",
  },
  signature: [26],
},{
  placeable: {
    heightRatio: 1,
    sprite: "chair",
  },
  signature: [0],
},{
  placeable: {
    heightRatio: 1,
    sprite: "bed",
  },
  signature: [1],
}, {
  placeable: {
    heightRatio: 1,
    sprite: "table",
  },
  signature: [2],
},{
  placeable: {
    heightRatio: 1,
    sprite: "coffin",
  },
  signature: [3],
},{
  placeable: {
    heightRatio: 1,
    sprite: "armorstand",
  },
  signature: [12],
},{
  placeable: {
    heightRatio: 1,
    sprite: "well",
  },
  signature: [18],
},{
  placeable: {
    heightRatio: 1,
    sprite: "trap",
  },
  signature: [23],
},{
  placeable: {
    heightRatio: 1,
    sprite: "weaponrack",
  },
  signature: [11],
}, {
  placeable: {
    heightRatio: 1,
    sprite: "coffer",
  },
  signature: [10],
}, {
  placeable: {
    heightRatio: 2,
    sprite: "cabinet",
  },
  heightRatio: 1,
  signature: [14],
}, {
  placeable: {
    heightRatio: 2,
    sprite: "statue",
  },
  signature: [15],
}, {
  cell: {
    heightRatio: 1,
    thinWall: true,
    wallTexture: "door_default",
    floorTexture: "floor_neutral",
  },
  signature: [8],
}, {
  cell: {
    heightRatio: 1,
    thinWall: true,
    wallTexture: "wallbar_default",
    floorTexture: "floor_neutral",
  },
  signature: [36, 38],
}]

export function prepareDefinitions(){
  const assetNames  = {
    textures:["wall_error", "floor_error"],
    sprites:[],
  };
  const tileCorrespondances = {};
  const buildingCorrespondances = {};
  const cellDefinitions = [undefined, {
    heightRatio: 1,
    wallTexture: "wall_error",
    floorTexture: "floor_error",
    stopView: true,
  }];
  const placeableDefinitions = [{
    heightRatio: 1,
  }];

  for (let base of tileCombinaisons) {
    let correspondance = {}
    if(base.cell) {
      const baseCell = {
        ...base.cell
      }
      cellDefinitions.push(baseCell);
      correspondance.cell = cellDefinitions.length - 1;
    }
    if(base.cell === 0){
      correspondance.cell = 0;
    }
    if(base.placeable) {
      const baseSprite = {
        ...base.placeable
      }
      placeableDefinitions.push(baseSprite);
      correspondance.placeable = placeableDefinitions.length - 1;
    }
    for (let signature of base.signature) {
      tileCorrespondances[getTileCode(signature)] = correspondance;
    }
    for (let variant of base.variants || []) {
      let correspondance = {}
      if(base.cell) {
        const baseCell = {
          ...base.cell,
          ...variant.cell || {}
        }
        cellDefinitions.push(baseCell);
        correspondance.cell = cellDefinitions.length - 1;
      }
      if(base.placeable) {
        const baseSprite = {
          ...base.placeable,
          ...variant.placeable || {}
        }
        placeableDefinitions.push(baseSprite);
        correspondance.placeable = placeableDefinitions.length - 1;
      }
      for (let signature of variant.signature) {
        tileCorrespondances[getTileCode(signature)] = correspondance;
      }
    }
  }

  for (let base of buildingCombinaisons) {
    let correspondance = {}
    if(base.placeable) {
      const basePlaceable = {
        ...base.placeable
      }
      placeableDefinitions.push(basePlaceable);
      correspondance.placeable = placeableDefinitions.length - 1;
    }
    if(base.cell) {
      const baseCell = {
        ...base.cell
      }
      cellDefinitions.push(baseCell);
      correspondance.cell = cellDefinitions.length - 1;
    }
    for (let signature of base.signature) {
      buildingCorrespondances[signature] = correspondance;
    }
  }

  for(let definition of cellDefinitions){
    if(definition){
      if(definition.wallTexture && !assetNames.textures.includes(definition.wallTexture)){
        assetNames.textures.push(definition.wallTexture);
      }
      if(definition.floorTexture && !assetNames.textures.includes(definition.floorTexture)){
        assetNames.textures.push(definition.floorTexture);
      }
    }
  }

  for(let definition of placeableDefinitions){
    if(definition && definition.sprite && !assetNames.sprites.includes(definition.sprite)){
      assetNames.sprites.push(definition.sprite);
    }
  }

  return {
    cellDefinitions,
    placeableDefinitions,
    tileCorrespondances,
    buildingCorrespondances,
    assetNames
  }
}