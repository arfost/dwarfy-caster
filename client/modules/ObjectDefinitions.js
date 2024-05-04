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
          "heightRatio": 2,
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

const creatureCombinaisons = [
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "LIZARD_FEMALE"
      },
      "signature": [
          "0,0",
          "302,0",
          "479,0",
          "482,0",
          "485,0",
          "491,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "LIZARD_MALE"
      },
      "signature": [
          "0,1",
          "302,1",
          "479,1",
          "482,1",
          "485,1",
          "491,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "LIZARD_MAN_FEMALE"
      },
      "signature": [
          "1,0",
          "303,0",
          "480,0",
          "483,0",
          "486,0",
          "492,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "LIZARD_MAN_MALE"
      },
      "signature": [
          "1,1",
          "303,1",
          "480,1",
          "483,1",
          "486,1",
          "492,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_LIZARD_FEMALE"
      },
      "signature": [
          "2,0",
          "304,0",
          "481,0",
          "484,0",
          "487,0",
          "493,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_LIZARD_MALE"
      },
      "signature": [
          "2,1",
          "304,1",
          "481,1",
          "484,1",
          "487,1",
          "493,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BIRD_FEMALE"
      },
      "signature": [
          "5,0",
          "8,0",
          "11,0",
          "14,0",
          "17,0",
          "20,0",
          "21,0",
          "22,0",
          "24,0",
          "25,0",
          "28,0",
          "30,0",
          "31,0",
          "33,0",
          "34,0",
          "37,0",
          "40,0",
          "43,0",
          "46,0",
          "52,0",
          "55,0",
          "58,0",
          "61,0",
          "64,0",
          "67,0",
          "70,0",
          "73,0",
          "76,0",
          "79,0",
          "82,0",
          "85,0",
          "88,0",
          "91,0",
          "94,0",
          "97,0",
          "100,0",
          "103,0",
          "106,0",
          "109,0",
          "112,0",
          "115,0",
          "179,0",
          "181,0",
          "184,0",
          "188,0",
          "189,0",
          "190,0",
          "305,0",
          "372,0",
          "415,0",
          "630,0",
          "632,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BIRD_MALE"
      },
      "signature": [
          "5,1",
          "8,1",
          "11,1",
          "14,1",
          "17,1",
          "20,1",
          "21,1",
          "22,1",
          "24,1",
          "25,1",
          "28,1",
          "30,1",
          "31,1",
          "33,1",
          "34,1",
          "37,1",
          "40,1",
          "43,1",
          "46,1",
          "52,1",
          "55,1",
          "58,1",
          "61,1",
          "64,1",
          "67,1",
          "70,1",
          "73,1",
          "76,1",
          "79,1",
          "82,1",
          "85,1",
          "88,1",
          "91,1",
          "94,1",
          "97,1",
          "100,1",
          "103,1",
          "106,1",
          "109,1",
          "112,1",
          "115,1",
          "179,1",
          "181,1",
          "184,1",
          "188,1",
          "189,1",
          "190,1",
          "305,1",
          "372,1",
          "415,1",
          "630,1",
          "632,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BIRD_MAN_FEMALE"
      },
      "signature": [
          "18,0",
          "92,0",
          "113,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BIRD_MAN_MALE"
      },
      "signature": [
          "18,1",
          "92,1",
          "113,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_BIRD_FEMALE"
      },
      "signature": [
          "19,0",
          "93,0",
          "114,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_BIRD_MALE"
      },
      "signature": [
          "19,1",
          "93,1",
          "114,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "DOG_FEMALE"
      },
      "signature": [
          "170,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "DOG_MALE"
      },
      "signature": [
          "170,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CAT_FEMALE"
      },
      "signature": [
          "171,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CAT_MALE"
      },
      "signature": [
          "171,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "EQUINE_DEFAULT"
      },
      "signature": [
          "172,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "EQUINE_FEMALE"
      },
      "signature": [
          "173,0",
          "174,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "EQUINE_MALE"
      },
      "signature": [
          "173,1",
          "174,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BOVINE_FEMALE"
      },
      "signature": [
          "175,0",
          "185,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BOVINE_MALE"
      },
      "signature": [
          "175,1",
          "185,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CAPRINE_FEMALE"
      },
      "signature": [
          "176,0",
          "178,0",
          "686,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CAPRINE_MALE"
      },
      "signature": [
          "176,1",
          "178,1",
          "686,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "PORCINE_FEMALE"
      },
      "signature": [
          "177,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "PORCINE_MALE"
      },
      "signature": [
          "177,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CERVINE_FEMALE"
      },
      "signature": [
          "183,0",
          "281,0",
          "317,0",
          "393,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CERVINE_MALE"
      },
      "signature": [
          "183,1",
          "281,1",
          "317,1",
          "393,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "RABBIT_FEMALE"
      },
      "signature": [
          "191,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "RABBIT_MALE"
      },
      "signature": [
          "191,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "FISH_FEMALE"
      },
      "signature": [
          "228,0",
          "245,0",
          "247,0",
          "248,0",
          "249,0",
          "250,0",
          "251,0",
          "252,0",
          "253,0",
          "254,0",
          "255,0",
          "256,0",
          "257,0",
          "258,0",
          "259,0",
          "260,0",
          "261,0",
          "268,0",
          "269,0",
          "270,0",
          "271,0",
          "446,0",
          "539,0",
          "540,0",
          "541,0",
          "542,0",
          "543,0",
          "544,0",
          "545,0",
          "546,0",
          "547,0",
          "548,0",
          "549,0",
          "550,0",
          "551,0",
          "552,0",
          "553,0",
          "554,0",
          "555,0",
          "556,0",
          "561,0",
          "562,0",
          "563,0",
          "564,0",
          "565,0",
          "566,0",
          "567,0",
          "568,0",
          "569,0",
          "570,0",
          "571,0",
          "617,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "FISH_MALE"
      },
      "signature": [
          "228,1",
          "245,1",
          "247,1",
          "248,1",
          "249,1",
          "250,1",
          "251,1",
          "252,1",
          "253,1",
          "254,1",
          "255,1",
          "256,1",
          "257,1",
          "258,1",
          "259,1",
          "260,1",
          "261,1",
          "268,1",
          "269,1",
          "270,1",
          "271,1",
          "446,1",
          "539,1",
          "540,1",
          "541,1",
          "542,1",
          "543,1",
          "544,1",
          "545,1",
          "546,1",
          "547,1",
          "548,1",
          "549,1",
          "550,1",
          "551,1",
          "552,1",
          "553,1",
          "554,1",
          "555,1",
          "556,1",
          "561,1",
          "562,1",
          "563,1",
          "564,1",
          "565,1",
          "566,1",
          "567,1",
          "568,1",
          "569,1",
          "570,1",
          "571,1",
          "617,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "SHARK_FEMALE"
      },
      "signature": [
          "229,0",
          "230,0",
          "231,0",
          "232,0",
          "233,0",
          "234,0",
          "235,0",
          "236,0",
          "237,0",
          "238,0",
          "239,0",
          "240,0",
          "241,0",
          "242,0",
          "243,0",
          "244,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "SHARK_MALE"
      },
      "signature": [
          "229,1",
          "230,1",
          "231,1",
          "232,1",
          "233,1",
          "234,1",
          "235,1",
          "236,1",
          "237,1",
          "238,1",
          "239,1",
          "240,1",
          "241,1",
          "242,1",
          "243,1",
          "244,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "FISH_MAN_FEMALE"
      },
      "signature": [
          "246,0",
          "447,0",
          "618,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "FISH_MAN_MALE"
      },
      "signature": [
          "246,1",
          "447,1",
          "618,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BEAR_FEMALE"
      },
      "signature": [
          "275,0",
          "278,0",
          "308,0",
          "396,0",
          "428,0",
          "737,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BEAR_MALE"
      },
      "signature": [
          "275,1",
          "278,1",
          "308,1",
          "396,1",
          "428,1",
          "737,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BEAR_MAN_FEMALE"
      },
      "signature": [
          "276,0",
          "279,0",
          "397,0",
          "738,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BEAR_MAN_MALE"
      },
      "signature": [
          "276,1",
          "279,1",
          "397,1",
          "738,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_BEAR_FEMALE"
      },
      "signature": [
          "277,0",
          "280,0",
          "398,0",
          "739,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_BEAR_MALE"
      },
      "signature": [
          "277,1",
          "280,1",
          "398,1",
          "739,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CERVINE_MAN_FEMALE"
      },
      "signature": [
          "282,0",
          "394,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CERVINE_MAN_MALE"
      },
      "signature": [
          "282,1",
          "394,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_CERVINE_FEMALE"
      },
      "signature": [
          "283,0",
          "395,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_CERVINE_MALE"
      },
      "signature": [
          "283,1",
          "395,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CANID_FEMALE"
      },
      "signature": [
          "284,0",
          "296,0",
          "641,0",
          "692,0",
          "704,0",
          "719,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CANID_MALE"
      },
      "signature": [
          "284,1",
          "296,1",
          "641,1",
          "692,1",
          "704,1",
          "719,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CANID_MAN_FEMALE"
      },
      "signature": [
          "285,0",
          "297,0",
          "642,0",
          "693,0",
          "705,0",
          "720,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CANID_MAN_MALE"
      },
      "signature": [
          "285,1",
          "297,1",
          "642,1",
          "693,1",
          "705,1",
          "720,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_CANID_FEMALE"
      },
      "signature": [
          "286,0",
          "298,0",
          "643,0",
          "694,0",
          "706,0",
          "721,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_CANID_MALE"
      },
      "signature": [
          "286,1",
          "298,1",
          "643,1",
          "694,1",
          "706,1",
          "721,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "FELINE_FEMALE"
      },
      "signature": [
          "329,0",
          "332,0",
          "335,0",
          "338,0",
          "341,0",
          "665,0",
          "716,0",
          "764,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "FELINE_MALE"
      },
      "signature": [
          "329,1",
          "332,1",
          "335,1",
          "338,1",
          "341,1",
          "665,1",
          "716,1",
          "764,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "FELINE_MAN_FEMALE"
      },
      "signature": [
          "330,0",
          "333,0",
          "336,0",
          "339,0",
          "342,0",
          "666,0",
          "717,0",
          "765,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "FELINE_MAN_MALE"
      },
      "signature": [
          "330,1",
          "333,1",
          "336,1",
          "339,1",
          "342,1",
          "666,1",
          "717,1",
          "765,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_FELINE_FEMALE"
      },
      "signature": [
          "331,0",
          "334,0",
          "337,0",
          "340,0",
          "343,0",
          "667,0",
          "718,0",
          "766,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_FELINE_MALE"
      },
      "signature": [
          "331,1",
          "334,1",
          "337,1",
          "340,1",
          "343,1",
          "667,1",
          "718,1",
          "766,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "SNAKE_FEMALE"
      },
      "signature": [
          "416,0",
          "659,0",
          "677,0",
          "683,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "SNAKE_MALE"
      },
      "signature": [
          "416,1",
          "659,1",
          "677,1",
          "683,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_FISH_FEMALE"
      },
      "signature": [
          "448,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_FISH_MALE"
      },
      "signature": [
          "448,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "RODENT_FEMALE"
      },
      "signature": [
          "502,0",
          "517,0",
          "525,0",
          "528,0",
          "656,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "RODENT_MALE"
      },
      "signature": [
          "502,1",
          "517,1",
          "525,1",
          "528,1",
          "656,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "RODENT_MAN_FEMALE"
      },
      "signature": [
          "503,0",
          "518,0",
          "526,0",
          "529,0",
          "657,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "RODENT_MAN_MALE"
      },
      "signature": [
          "503,1",
          "518,1",
          "526,1",
          "529,1",
          "657,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_RODENT_FEMALE"
      },
      "signature": [
          "504,0",
          "527,0",
          "530,0",
          "658,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_RODENT_MALE"
      },
      "signature": [
          "504,1",
          "527,1",
          "530,1",
          "658,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "FISH_DEFAULT"
      },
      "signature": [
          "557,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "DWARF_FEMALE"
      },
      "signature": [
          "572,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "DWARF_MALE"
      },
      "signature": [
          "572,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "HUMAN_FEMALE"
      },
      "signature": [
          "573,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "HUMAN_MALE"
      },
      "signature": [
          "573,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "ELF_FEMALE"
      },
      "signature": [
          "574,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "ELF_MALE"
      },
      "signature": [
          "574,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GOBLIN_FEMALE"
      },
      "signature": [
          "575,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GOBLIN_MALE"
      },
      "signature": [
          "575,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "KOBOLD_FEMALE"
      },
      "signature": [
          "576,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "KOBOLD_MALE"
      },
      "signature": [
          "576,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "TROLL_FEMALE"
      },
      "signature": [
          "578,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "TROLL_MALE"
      },
      "signature": [
          "578,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "OGRE_FEMALE"
      },
      "signature": [
          "579,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "OGRE_MALE"
      },
      "signature": [
          "579,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "UNICORN_FEMALE"
      },
      "signature": [
          "580,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "UNICORN_MALE"
      },
      "signature": [
          "580,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "DRAGON_FEMALE"
      },
      "signature": [
          "581,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "DRAGON_MALE"
      },
      "signature": [
          "581,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BIRD_ROC_FEMALE"
      },
      "signature": [
          "604,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "BIRD_ROC_MALE"
      },
      "signature": [
          "604,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "SNAKE_DEFAULT"
      },
      "signature": [
          "620,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "MARSUPIAL_FEMALE"
      },
      "signature": [
          "644,0",
          "647,0",
          "689,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "MARSUPIAL_MALE"
      },
      "signature": [
          "644,1",
          "647,1",
          "689,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "MARSUPIAL_MAN_FEMALE"
      },
      "signature": [
          "645,0",
          "648,0",
          "690,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "MARSUPIAL_MAN_MALE"
      },
      "signature": [
          "645,1",
          "648,1",
          "690,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_MARSUPIAL_FEMALE"
      },
      "signature": [
          "646,0",
          "649,0",
          "691,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_MARSUPIAL_MALE"
      },
      "signature": [
          "646,1",
          "649,1",
          "691,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "SNAKE_MAN_FEMALE"
      },
      "signature": [
          "660,0",
          "678,0",
          "684,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "SNAKE_MAN_MALE"
      },
      "signature": [
          "660,1",
          "678,1",
          "684,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_SNAKE_FEMALE"
      },
      "signature": [
          "661,0",
          "679,0",
          "685,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_SNAKE_MALE"
      },
      "signature": [
          "661,1",
          "679,1",
          "685,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "HARE_FEMALE"
      },
      "signature": [
          "674,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "HARE_MALE"
      },
      "signature": [
          "674,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CAPRINE_MAN_FEMALE"
      },
      "signature": [
          "687,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "CAPRINE_MAN_MALE"
      },
      "signature": [
          "687,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_CAPRINE_FEMALE"
      },
      "signature": [
          "688,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "GIANT_CAPRINE_MALE"
      },
      "signature": [
          "688,1"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "FORGOTTEN_BEAST_DEFAULT"
      },
      "signature": [
          "767,0",
          "768,0",
          "769,0",
          "770,0",
          "771,0",
          "772,0",
          "773,0",
          "774,0",
          "775,0",
          "776,0",
          "777,0",
          "778,0",
          "779,0",
          "780,0",
          "781,0",
          "782,0",
          "783,0",
          "784,0",
          "785,0",
          "786,0",
          "787,0",
          "788,0",
          "789,0",
          "790,0",
          "791,0",
          "792,0",
          "793,0",
          "794,0",
          "795,0",
          "796,0",
          "797,0",
          "798,0",
          "799,0",
          "800,0",
          "801,0",
          "802,0",
          "803,0",
          "804,0",
          "805,0",
          "806,0",
          "807,0",
          "808,0",
          "809,0",
          "810,0",
          "811,0",
          "812,0",
          "813,0",
          "814,0",
          "815,0",
          "816,0",
          "817,0",
          "818,0",
          "819,0",
          "820,0",
          "821,0",
          "822,0",
          "823,0",
          "824,0",
          "825,0",
          "826,0",
          "827,0",
          "828,0",
          "829,0",
          "830,0",
          "831,0",
          "832,0",
          "833,0",
          "834,0",
          "835,0",
          "836,0",
          "837,0",
          "838,0",
          "839,0",
          "840,0",
          "841,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "TITAN_DEFAULT"
      },
      "signature": [
          "842,0",
          "843,0",
          "844,0",
          "845,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "DEMON_DEFAULT"
      },
      "signature": [
          "846,0",
          "847,0",
          "848,0",
          "851,0",
          "852,0",
          "853,0",
          "854,0",
          "855,0",
          "856,0",
          "857,0",
          "858,0",
          "861,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "DEMON_FEMALE"
      },
      "signature": [
          "849,0",
          "850,0",
          "859,0",
          "860,0"
      ]
  },
  {
      "placeable": {
          "heightRatio": 1,
          "sprite": "DEMON_MALE"
      },
      "signature": [
          "849,1",
          "850,1",
          "859,1",
          "860,1"
      ]
  }
]

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