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
    floorTexture: "shrub_floor",
  },
  placeable:{
    heightRatio: 1,
    sprite: "shrub",
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
    },
    {
      cell:{
        floorTexture: "wall_floor_brook", // neutre
      },
      signature:[
        "BROOK_BED-BROOK-NO_SPECIAL",
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

const buildingCombinaisons = [
  {
      "placeable": {
          "heightRatio": 1,
          "name": "NONE",
          "sprite": "NONE"
      },
      "signature": [
          "-1,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Chair",
          "sprite": "Chair"
      },
      "signature": [
          "0,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Bed",
          "sprite": "Bed"
      },
      "signature": [
          "1,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Table",
          "sprite": "table"
      },
      "signature": [
          "2,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Coffin",
          "sprite": "Coffin"
      },
      "signature": [
          "3,-1,-1"
      ]
  },
  {
      "cell": {
          "floorTexture": "FarmPlot"
      },
      "signature": [
          "4,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Furnace",
          "sprite": "Furnace"
      },
      "signature": [
          "5,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Wood Furnace",
          "sprite": "Furnace/WoodFurnace"
      },
      "signature": [
          "5,0,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Smelter",
          "sprite": "Furnace/Smelter"
      },
      "signature": [
          "5,1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Glass Furnace",
          "sprite": "Furnace/GlassFurnace"
      },
      "signature": [
          "5,2,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Kiln",
          "sprite": "Furnace/Kiln"
      },
      "signature": [
          "5,3,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Magma Smelter",
          "sprite": "Furnace/MagmaSmelter"
      },
      "signature": [
          "5,4,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Magma Glass Furnace",
          "sprite": "Furnace/MagmaGlassFurnace"
      },
      "signature": [
          "5,5,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Magma Kiln",
          "sprite": "Furnace/MagmaKiln"
      },
      "signature": [
          "5,6,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Custom Furnace",
          "sprite": "Furnace/Custom"
      },
      "signature": [
          "5,7,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Trade Depot",
          "sprite": "TradeDepot"
      },
      "signature": [
          "6,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Shop",
          "sprite": "Shop"
      },
      "signature": [
          "7,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "GeneralStore",
          "sprite": "Shop/GeneralStore"
      },
      "signature": [
          "7,0,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "CraftsMarket",
          "sprite": "Shop/CraftsMarket"
      },
      "signature": [
          "7,1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "ClothingShop",
          "sprite": "Shop/ClothingShop"
      },
      "signature": [
          "7,2,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "ExoticClothingShop",
          "sprite": "Shop/ExoticClothingShop"
      },
      "signature": [
          "7,3,-1"
      ]
  },
  {
      "cell": {
          "heightRatio": 1,
          "thinWall": true,
          "wallTexture": "Door",
          "floorTexture": "floor_neutral"
      },
      "signature": [
          "8,-1,-1"
      ]
  },
  {
      "cell": {
          "heightRatio": 1,
          "thinWall": true,
          "wallTexture": "Floodgate",
          "floorTexture": "floor_neutral"
      },
      "signature": [
          "9,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Box",
          "sprite": "Box"
      },
      "signature": [
          "10,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Weapon Rack",
          "sprite": "Weaponrack"
      },
      "signature": [
          "11,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Armor Stand",
          "sprite": "Armorstand"
      },
      "signature": [
          "12,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Workshop",
          "sprite": "Workshop"
      },
      "signature": [
          "13,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Carpenter's Workshop",
          "sprite": "Workshop/Carpenters"
      },
      "signature": [
          "13,0,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Farmer's Workshop",
          "sprite": "Workshop/Farmers"
      },
      "signature": [
          "13,1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Mason's Workshop",
          "sprite": "Workshop/Masons"
      },
      "signature": [
          "13,2,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Craftsdwarf's Workshop",
          "sprite": "Workshop/Craftsdwarfs"
      },
      "signature": [
          "13,3,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Jeweler's Workshop",
          "sprite": "Workshop/Jewelers"
      },
      "signature": [
          "13,4,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Metalsmith's Forge",
          "sprite": "Workshop/MetalsmithsForge"
      },
      "signature": [
          "13,5,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Magma Forge",
          "sprite": "Workshop/MagmaForge"
      },
      "signature": [
          "13,6,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Bowyer's Workshop",
          "sprite": "Workshop/Bowyers"
      },
      "signature": [
          "13,7,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Mechanic's Workshop",
          "sprite": "Workshop/Mechanics"
      },
      "signature": [
          "13,8,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Siege Workshop",
          "sprite": "Workshop/Siege"
      },
      "signature": [
          "13,9,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Butcher's Shop",
          "sprite": "Workshop/Butchers"
      },
      "signature": [
          "13,10,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Leather Works",
          "sprite": "Workshop/Leatherworks"
      },
      "signature": [
          "13,11,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Tanner's Shop",
          "sprite": "Workshop/Tanners"
      },
      "signature": [
          "13,12,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Clothier's Shop",
          "sprite": "Workshop/Clothiers"
      },
      "signature": [
          "13,13,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Fishery",
          "sprite": "Workshop/Fishery"
      },
      "signature": [
          "13,14,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Still",
          "sprite": "Workshop/Still"
      },
      "signature": [
          "13,15,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Loom",
          "sprite": "Workshop/Loom"
      },
      "signature": [
          "13,16,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Quern",
          "sprite": "Workshop/Quern"
      },
      "signature": [
          "13,17,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Kennels",
          "sprite": "Workshop/Kennels"
      },
      "signature": [
          "13,18,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Kitchen",
          "sprite": "Workshop/Kitchen"
      },
      "signature": [
          "13,19,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Ashery",
          "sprite": "Workshop/Ashery"
      },
      "signature": [
          "13,20,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Dyer's Shop",
          "sprite": "Workshop/Dyers"
      },
      "signature": [
          "13,21,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Millstone",
          "sprite": "Workshop/Millstone"
      },
      "signature": [
          "13,22,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Custom Workshop",
          "sprite": "Workshop/Custom"
      },
      "signature": [
          "13,23,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Soap Maker's Workshop",
          "sprite": "Workshop/SOAP_MAKER"
      },
      "signature": [
          "13,23,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Screw Press",
          "sprite": "Workshop/SCREW_PRESS"
      },
      "signature": [
          "13,23,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Tool",
          "sprite": "Workshop/Tool"
      },
      "signature": [
          "13,24,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Cabinet",
          "sprite": "Cabinet"
      },
      "signature": [
          "14,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 2,
          "name": "Statue",
          "sprite": "Statue"
      },
      "signature": [
          "15,-1,-1"
      ]
  },
  {
      "cell": {
          "heightRatio": 1,
          "thinWall": true,
          "wallTexture": "WindowGlass",
          "floorTexture": "floor_neutral"
      },
      "signature": [
          "16,-1,-1"
      ]
  },
  {
      "cell": {
          "heightRatio": 1,
          "thinWall": true,
          "wallTexture": "WindowGem",
          "floorTexture": "floor_neutral"
      },
      "signature": [
          "17,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Well",
          "sprite": "Well"
      },
      "cell": {
        "floorTexture": "well_floor",
    },
      "signature": [
          "18,-1,-1"
      ]
  },
  {
      "cell": {
          "heightRatio": 0.25,
          "floorTexture": "bridge_floor",
          "wallTexture": "bridge_wall"
      },
      "signature": [
          "19,-1,-1"
      ]
  },
  {
      "cell": {
        "floorTexture": "dirty_road",
      },
      "signature": [
          "20,-1,-1"
      ]
  },
  {
    "cell": {
      "floorTexture": "paved_road",
    },
      "signature": [
          "21,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Siege Engine",
          "sprite": "SiegeEngine"
      },
      "signature": [
          "22,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Catapult",
          "sprite": "SiegeEngine/Catapult"
      },
      "signature": [
          "22,0,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Ballista",
          "sprite": "SiegeEngine/Ballista"
      },
      "signature": [
          "22,1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Trap",
          "sprite": "Trap"
      },
      "signature": [
          "23,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Lever",
          "sprite": "Trap/Lever"
      },
      "signature": [
          "23,0,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "PressurePlate",
          "sprite": "Trap/PressurePlate"
      },
      "signature": [
          "23,1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "CageTrap",
          "sprite": "Trap/CageTrap"
      },
      "signature": [
          "23,2,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "StoneFallTrap",
          "sprite": "Trap/StoneFallTrap"
      },
      "signature": [
          "23,3,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "WeaponTrap",
          "sprite": "Trap/WeaponTrap"
      },
      "signature": [
          "23,4,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "TrackStop",
          "sprite": "Trap/TrackStop"
      },
      "signature": [
          "23,5,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Animal Trap",
          "sprite": "AnimalTrap"
      },
      "signature": [
          "24,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Support",
          "sprite": "Support"
      },
      "signature": [
          "25,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Archery Target",
          "sprite": "ArcheryTarget"
      },
      "signature": [
          "26,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Chain",
          "sprite": "Chain"
      },
      "signature": [
          "27,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Cage",
          "sprite": "Cage"
      },
      "signature": [
          "28,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Weapon",
          "sprite": "Weapon"
      },
      "signature": [
          "31,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Wagon",
          "sprite": "Wagon"
      },
      "signature": [
          "32,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Screw Pump",
          "sprite": "ScrewPump"
      },
      "signature": [
          "33,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Hatch",
          "sprite": "Hatch"
      },
      "signature": [
          "35,-1,-1"
      ]
  },
  {
      "cell": {
          "heightRatio": 1,
          "thinWall": true,
          "wallTexture": "GrateWall",
          "floorTexture": "floor_neutral"
      },
      "signature": [
          "36,-1,-1"
      ]
  },
  {
      "cell": {
          "floorTexture": "GrateFloor"
      },
      "signature": [
          "37,-1,-1"
      ]
  },
  {
      "cell": {
          "heightRatio": 1,
          "thinWall": true,
          "wallTexture": "BarsVertical",
          "floorTexture": "floor_neutral"
      },
      "signature": [
          "38,-1,-1"
      ]
  },
  {
      "cell": {
          "floorTexture": "BarsFloor"
      },
      "signature": [
          "39,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Gear Assembly",
          "sprite": "GearAssembly"
      },
      "signature": [
          "40,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Horizontal Axle",
          "sprite": "AxleHorizontal"
      },
      "signature": [
          "41,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Vertical Axle",
          "sprite": "AxleVertical"
      },
      "signature": [
          "42,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Water Wheel",
          "sprite": "WaterWheel"
      },
      "signature": [
          "43,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Windmill",
          "sprite": "Windmill"
      },
      "signature": [
          "44,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Traction Bench",
          "sprite": "TractionBench"
      },
      "signature": [
          "45,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Slab",
          "sprite": "Slab"
      },
      "signature": [
          "46,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Nest",
          "sprite": "Nest"
      },
      "signature": [
          "47,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Nest Box",
          "sprite": "NestBox"
      },
      "signature": [
          "48,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Hive",
          "sprite": "Hive"
      },
      "signature": [
          "49,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Rollers",
          "sprite": "Rollers"
      },
      "signature": [
          "50,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Instrument",
          "sprite": "Instrument"
      },
      "signature": [
          "51,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Bookcase",
          "sprite": "Bookcase"
      },
      "signature": [
          "52,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Display Furniture",
          "sprite": "DisplayFurniture"
      },
      "signature": [
          "53,-1,-1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "name": "Offering Place",
          "sprite": "OfferingPlace"
      },
      "signature": [
          "54,-1,-1"
      ]
  }
]

const flowCombinaisons = [{
  placeable: {
    heightRatio: 1,
    sprite: "miasma-light",
  },
  signature: ["0-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "steam-light",
  },
  signature: ["1-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "mist-light",
  },
  signature: ["2-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "materialDust-light",
  },
  signature: ["3-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "magmaMist-light",
  },
  signature: ["4-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "smoke-light",
  },
  signature: ["5-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "dragonfire-light",
  },
  signature: ["6-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "fire-light",
  },
  signature: ["7-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "web-light",
  },
  signature: ["8-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "materialGas-light",
  },
  signature: ["9-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "materialVapor-light",
  },
  signature: ["10-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "oceanWave-light",
  },
  signature: ["11-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "seaFoam-light",
  },
  signature: ["12-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "itemCloud-light",
  },
  signature: ["13-light"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "miasma-medium",
  },
  signature: ["0-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "steam-medium",
  },
  signature: ["1-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "mist-medium",
  },
  signature: ["2-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "materialDust-medium",
  },
  signature: ["3-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "magmaMist-medium",
  },
  signature: ["4-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "smoke-medium",
  },
  signature: ["5-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "dragonfire-medium",
  },
  signature: ["6-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "fire-medium",
  },
  signature: ["7-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "web-medium",
  },
  signature: ["8-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "materialGas-medium",
  },
  signature: ["9-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "materialVapor-medium",
  },
  signature: ["10-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "oceanWave-medium",
  },
  signature: ["11-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "seaFoam-medium",
  },
  signature: ["12-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "itemCloud-medium",
  },
  signature: ["13-medium"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "miasma-heavy",
  },
  signature: ["0-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "steam-heavy",
  },
  signature: ["1-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "mist-heavy",
  },
  signature: ["2-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "materialDust-heavy",
  },
  signature: ["3-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "magmaMist-heavy",
  },
  signature: ["4-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "smoke-heavy",
  },
  signature: ["5-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "dragonfire-heavy",
  },
  signature: ["6-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "fire-heavy",
  },
  signature: ["7-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "web-heavy",
  },
  signature: ["8-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "materialGas-heavy",
  },
  signature: ["9-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "materialVapor-heavy",
  },
  signature: ["10-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "oceanWave-heavy",
  },
  signature: ["11-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "seaFoam-heavy",
  },
  signature: ["12-heavy"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "itemCloud-heavy",
  },
  signature: ["13-heavy"],
}]

const creatureCombinaisons = [{
  placeable: {
    heightRatio: 1,
    sprite: "dwarf_male",
  },
  signature: ["572,1"],
},{
  placeable: {
    heightRatio: 1,
    sprite: "dwarf_female",
  },
  signature: ["572,0"],
}]

export function prepareDefinitions(){
  const assetNames  = {
    textures:["wall_error", "floor_error"],
    sprites:[],
  };
  
  const cellDefinitions = [undefined, {
    heightRatio: 1,
    wallTexture: "wall_error",
    floorTexture: "floor_error",
    stopView: true,
  }];
  const placeableDefinitions = [{
    heightRatio: 1,
  }];
  
  const tileCorrespondances = {};
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

  //prepare building definitions
  const buildingCorrespondances = {};
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

  // prepare flow definitions
  const flowCorrespondances = {};
  for (let base of flowCombinaisons) {
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
      flowCorrespondances[signature] = correspondance;
    }
  }

  //prepare creature definitions
  const creatureCorrespondances = {};
  for (let base of creatureCombinaisons) {
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
      creatureCorrespondances[signature] = correspondance;
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
      assetNames.sprites.push({
        name:definition.sprite,
        heightRatio:definition.heightRatio
      });
    }
  }

  return {
    cellDefinitions,
    placeableDefinitions,
    flowCorrespondances,
    tileCorrespondances,
    buildingCorrespondances,
    creatureCorrespondances,
    assetNames
  }
}