const tileCombinaisons = [
  {
    signature: [
      "4,-1,-1"
    ],
    cell: {
      heightRatio: 1,
      stopView: true,
      wallTexture: "wall_default",
      floorTexture: "floor_default",
    },
    variants: [{
      cell: {
        floorTexture: "floor_default",
        wallTexture: "wall_wood",
      },
      signature: [
        "4,23,-1",
        "4,23,3"
      ],
    }, {
      cell: {
        wallTexture: "wall_stone_rough",
        floorTexture: "floor_default",
      },
      signature: [
        "4,2,-1",
        "4,2,0",
        "4,5,-1",
        "4,5,0",
        "4,4,-1",
        "4,4,0"
      ],
    }, {
      cell: {
        wallTexture: "wall_soil",
        floorTexture: "floor_default",
      },
      signature: [
        "4,1,-1"
      ],
    }, {
      cell: {
        wallTexture: "wall_construction",
        floorTexture: "floor_default",
      },
      signature: [
        "4,7,-1",
        "4,7,3"
      ],
    }, {
      cell: {
        wallTexture: "wall_smooth_stone",
        floorTexture: "floor_default",
      },
      signature: [
        "4,2,3",
        "4,5,3"
      ],
    }],
  },
  {
    //slope
    cell: {
      heightRatio: 0.5,
      wallTexture: "slope_stone_rough",
      floorTexture: "floor_default",
    },
    signature: [
      "9,-1,-1"
    ],
    variants: [{
      wallTexture: "slope_wood",
      floorTexture: "floor_default",
      signature: [
        "9,23,-1"
      ],
    }, {
      cell: {
        wallTexture: "slope_stone_rough",
        floorTexture: "floor_default",
      },
      signature: [
        "9,2,-1",
        "9,5,-1",
        "9,2,0",
        "9,5,0"
      ],
    }, {
      cell: {
        wallTexture: "slope_soil",
        floorTexture: "floor_default",
      },
      signature: [
        "9,1,-1"
      ],
    }, {
      cell: {
        wallTexture: "slope_construction",
        floorTexture: "floor_default",
      },
      signature: [
        "9,7,-1",
        "9,7,3"
      ],
    }, {
      cell: {
        wallTexture: "slope_smooth_stone",
        floorTexture: "floor_default",
      },
      signature: [
        "9,2,3"
      ],
    }],
  },
  {
    //stairs
    cell: {
      heightRatio: 0.3,
      wallTexture: "stairs_stone_rough",
      floorTexture: "floor_default",
    },
    signature: [
      "6,-1,-1",
      "7,-1,-1",
      "8,-1,-1"
    ],
    variants: [{
      cell: {
        wallTexture: "stairs_wood",
        floorTexture: "floor_default",
      },
      signature: [
        "6,23,-1",
        "7,23,-1",
        "8,23,-1"
      ],
    }, {
      //grass
      cell: {
        tint: "#00ff00",
      },
      signature: [
        "8,8,-1",
        "8,9,-1"
      ],
    }, {
      cell: {
        wallTexture: "stairs_stone_rough",
        floorTexture: "floor_default",
      },
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
      cell: {
        wallTexture: "stairs_soil",
        floorTexture: "floor_default",
      },
      signature: [
        "6,1,-1",
        "7,1,-1",
        "8,1,-1"
      ],
    }, {
      cell: {
        wallTexture: "stairs_construction",
        floorTexture: "floor_default",
      },
      signature: [
        "6,7,-1",
        "7,7,-1",
        "8,7,-1",
        "6,7,3",
        "7,7,3",
        "8,7,3"
      ],
    }, {
      cell: {
        wallTexture: "stairs_smooth_stone",
        floorTexture: "floor_default",
      },
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
    cell: {
      heightRatio: 1,
      wallTexture: "fortification_default",
      floorTexture: "floor_default",
    },
    signature: [
      "5,-1,-1"
    ]
  },
  {
    //floor
    cell: {
      floorTexture: "floor_default",
      tint: '#ffffff',
    },
    signature: [
      "1,-1,-1",
      "2,-1,-1",
      "3,-1,-1",
      "10,-1,-1"
    ],
    variants: [{
      cell: {
        tint: '#876929',
      },
      signature: [
        "1,23,-1",
        "2,23,-1",
        "3,23,-1",
        "10,23,-1"
      ],
    }, {
      cell: {
        tint: '#A0A0A0',
      },
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
      cell: {
        tint: '#412D1F',
      },
      signature: [
        "1,1,-1",
        "2,1,-1",
        "3,1,-1",
        "10,1,-1"
      ],
    }, {
      cell: {
        tint: '#999999',
      },
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
      cell: {
        tint: '#cccccc',
      },
      signature: [
        "1,2,3",
        "2,2,3",
        "3,2,3",
      ],
    }],
  }, {
    cell: {
      heightRatio: 1,
      wallTexture: "feuillage_default",
      floorTexture: "feuillage_default",
    },
    //feuillage
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
      cell: {
        tint: '#cccccc',
      },
      
      signature: [
        "15,12,6",
        "14,12,6"
      ],
    }],
  }, {
    //branches
    cell: {
      heightRatio: 1,
      wallTexture: "branch_default",
      floorTexture: "branch_default",
    },
    signature: [
      "18,23,-1",
    ],
  }]

const buildingCombinaisons = [{
  placeable: {
    sprite: "sprite_bed",
  },
  signature: [1],
}, {
  placeable: {
    sprite: "sprite_chair",
  },
  signature: [0],
}, {
  placeable: {
    sprite: "sprite_table",
  },
  signature: [2],
}, {
  placeable: {
    sprite: "sprite_coffer",
  },
  signature: [10],
}, {
  placeable: {
    sprite: "sprite_cabinet",
  },
  heightRatio: 1,
  signature: [14],
}, {
  placeable: {
    sprite: "sprite_statue",
  },
  signature: [15],
}, {
  cell: {
    heightRatio: 1,
    thinWall: true,
    wallTexture: "door_default",
    floorTexture: "floor_default",
  },
  signature: [8],
}, {
  cell: {
    heightRatio: 1,
    thinWall: true,
    wallTexture: "wallbar_default",
    floorTexture: "floor_default",
  },
  signature: [36, 38],
}]

export function prepareDefinitions(){
  const tileCorrespondances = {};
  const buildingCorrespondances = {};
  const cellDefinitions = [undefined];
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
    if(base.placeable) {
      const baseSprite = {
        ...base.placeable
      }
      placeableDefinitions.push(baseSprite);
      correspondance.placeable = placeableDefinitions.length - 1;
    }
    for (let signature of base.signature) {
      tileCorrespondances[signature] = correspondance;
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
        tileCorrespondances[signature] = correspondance;
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

  return {
    cellDefinitions,
    placeableDefinitions,
    tileCorrespondances,
    buildingCorrespondances
  }
}