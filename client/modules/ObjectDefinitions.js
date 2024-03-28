const cellCombinaisons = [
  {
  // wall
  heightRatio: 1,
  stopView: true,
  walkable: true,
  texture: "wall_default",
  signature: [
    "4,-1,-1"
  ],
  variants: [{
    texture: "wall_wood",
    signature: [
      "4,23,-1",
      "4,23,3"
    ],
  }, {
    texture: "wall_stone_rough",
    signature: [
      "4,2,-1",
      "4,2,0",
      "4,5,-1",
      "4,5,0",
      "4,4,-1",
      "4,4,0"
    ],
  }, {
    texture: "wall_soil",
    signature: [
      "4,1,-1"
    ],
  }, {
    texture: "wall_construction",
    signature: [
      "4,7,-1",
      "4,7,3"
    ],
  }, {
    texture: "wall_smooth_stone",
    signature: [
      "4,2,3",
      "4,5,3"
    ],
  }],
}, 
{
  //slope
  heightRatio: 0.5,
  passable: true,
  texture: "slope_stone_rough",
  signature: [
    "9,-1,-1"
  ],
  variants: [{
    texture: "slope_wood",
    signature: [
      "9,23,-1"
    ],
  }, {
    texture: "slope_stone_rough",
    signature: [
      "9,2,-1",
      "9,5,-1",
      "9,2,0",
      "9,5,0"
    ],
  }, {
    texture: "slope_soil",
    signature: [
      "9,1,-1"
    ],
  }, {
    texture: "slope_construction",
    signature: [
      "9,7,-1",
      "9,7,3"
    ],
  }, {
    texture: "slope_smooth_stone",
    signature: [
      "9,2,3"
    ],
  }],
}, 
{
  //stairs
  heightRatio: 0.5,
  climbable: true,
  passable: true,
  texture: "stairs_stone_rough",
  signature: [
    "6,-1,-1",
    "7,-1,-1",
    "8,-1,-1"
  ],
  variants: [{
    texture: "stairs_wood",
    signature: [
      "6,23,-1",
      "7,23,-1",
      "8,23,-1"
    ],
  },{
    //grass
    tint: "#00ff00",
    signature: [
      "8,8,-1",
      "8,9,-1"
    ],
  }, {
    texture: "stairs_stone_rough",
    signature: [
      "6,2,-1",
      "7,2,-1",
      "8,2,-1",
      "6,2,0",
      "7,2,0",
      "8,2,0",
      "6,5,-1",
      "7,5,-1",
      "8,5,-1",
      "6,5,0",
      "7,5,0",
      "8,5,0"
    ],
  }, {
    texture: "stairs_soil",
    signature: [
      "6,1,-1",
      "7,1,-1",
      "8,1,-1"
    ],
  }, {
    texture: "stairs_construction",
    signature: [
      "6,7,-1",
      "7,7,-1",
      "8,7,-1",
      "6,7,3",
      "7,7,3",
      "8,7,3"
    ],
  }, {
    texture: "stairs_smooth_stone",
    signature: [
      "6,2,3",
      "7,2,3",
      "8,2,3",
      "6,5,3",
      "7,5,3",
      "8,5,3"
    ],
  }],
}, 
{
  //fortification
  heightRatio: 1,
  walkable: true,
  texture: "fortification_default",
  signature: [
    "5,-1,-1"
  ]
}, 
{
  //floor
  heightRatio: 0.1,
  passable: true,
  texture: "floor_default",
  tint: '#ffffff',
  signature: [
    "1,-1,-1",
    "2,-1,-1",
    "3,-1,-1",
    "10,-1,-1"
  ],
  variants: [{
    tint: '#876929',
    signature: [
      "1,23,-1",
      "2,23,-1",
      "3,23,-1",
      "10,23,-1"
    ],
  }, {
    tint: '#A0A0A0',
    signature: [
      "1,2,-1",
      "1,2,3",
      "2,2,-1",
      "3,2,-1",
      "10,2,-1",
      "1,2,0",
      "2,2,0",
      "3,2,0",
      "10,2,0",
      "1,4,0",
      "2,4,0",
      "3,4,0",
      "10,4,0",
      "1,5,0",
      "2,5,0",
      "3,5,0",
      "10,5,0"
    ],
  }, {
    tint: '#412D1F',
    signature: [
      "1,1,-1",
      "2,1,-1",
      "3,1,-1",
      "10,1,-1"
    ],
  }, {
    tint: '#999999',
    signature: [
      "1,7,-1",
      "2,7,-1",
      "3,7,-1",
      "10,7,-1",
      "1,7,3",
      "2,7,3",
      "3,7,3",
      "10,7,3"
    ],
  }, {
    tint: '#cccccc',
    signature: [
      "1,2,3",
      "2,2,3",
      "3,2,3",
    ],
  }],
}, {
  //feuillage
  heightRatio: 1,
  passable: true,
  alpha: 0.5,
  texture: "feuillage_default",
  signature: [
    "17,-1,-1",
    "14,-1,-1",
    "15,-1,-1",
    "17,23,-1",
    "14,23,-1",
    "15,23,-1",
    "17,12,-1",
    "14,12,-1",
    "15,12,-1",
  ],
  variants: [{
    tint: '#cccccc',
    signature: [
      "15,12,6",
      "14,12,6"
    ],
  }],
}, {
  //branches
  heightRatio: 1,
  walkable: true,
  texture: "branch_default",
  signature: [
    "18,23,-1",
  ],
}]

const placeableCombinaisons = [{
  sprite: "sprite_bed",
  signature:[1],
},{
  sprite: "sprite_chair",
  signature:[0],
},{
  sprite: "sprite_table",
  signature:[2],
},{
  sprite: "sprite_coffer",
  signature:[10],
},{
  sprite: "sprite_cabinet",
  heightRatio: 1,
  signature:[14],
},{
  sprite: "sprite_statue",
  signature:[15],
},{
  sprite: "sprite_wallbar",
  signature:[39],
},{
  sprite: "sprite_door",
  heightRatio: 1,
  signature:[8],
}]

export function prepareCellDefinitions() {
  const cellDefinitions = [undefined];
  const correspondances = {};
  for(let base of cellCombinaisons) {
    const baseBlock = {
      heightRatio: base.heightRatio,
      passable: base.passable,
      stopView: base.stopView,
      climbable: base.climbable,
      walkable: base.walkable,
      alpha: base.alpha,
      tint: base.tint,
      texture: base.texture,
    }
    cellDefinitions.push(baseBlock);
    for(let signature of base.signature) {
      correspondances[signature] = cellDefinitions.length-1;
    }
    for(let variant of base.variants || []) {
      const variantBlock = {
        heightRatio: variant.heightRatio || base.heightRatio,
        passable: variant.passable || base.passable,
        stopView: variant.stopView || base.stopView,
        climbable: variant.climbable || base.climbable,
        walkable: variant.walkable || base.walkable,
        alpha: variant.alpha || base.alpha,
        tint: variant.tint || base.tint,
        texture: variant.texture || base.texture,
      }
      cellDefinitions.push(variantBlock);
      for(let signature of variant.signature) {
        correspondances[signature] = cellDefinitions.length-1;
      }
    }
  }
  return {
    cellDefinitions, correspondances
  };
}

export function preparePlaceableDefinitions() {
  const placeableDefinitions = [{
    heightRatio: 1,
  }];
  const correspondances = {};
  for(let base of placeableCombinaisons) {
    const baseBlock = {
      sprite: base.sprite,
      heightRatio: base.heightRatio || 1,
    }
    placeableDefinitions.push(baseBlock);
    for(let signature of base.signature) {
      correspondances[signature] = placeableDefinitions.length-1;
    }
  }

  return {
    placeableDefinitions, correspondances
  };
}

// color variants
// WHITE
// LGRAY
// DGRAY
// BROWN
// YELLOW
// RED
// LRED
// GREEN
// LGREEN
// CYAN
// LCYAN
// BLUE
// LBLUE
// MAGENTA
// LMAGENTA

// wall_default
// wall_wood
// wall_stone_rough
// wall_soil
// wall_construction
// wall_smooth_stone
// slope_default
// slope_wood
// slope_stone_rough
// slope_soil
// slope_construction
// slope_smooth_stone
// stairs_default
// stairs_wood
// stairs_stone_rough
// stairs_soil
// stairs_construction
// stairs_smooth_stone
// fortification_default
// floor_default
// feuillage_default
// branch_defaultv