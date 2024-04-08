//import fs
const fs = require('fs');

const categories = {
  "-1,-1,-1": [
      "Void",
      "Unused999",
      "Unused9999",
      "Unused99999",
      "Unused999999",
      "Unused888",
      "Unused8888",
      "Unused88888",
      "Unused888888",
      "Unused245",
      "Unused246",
      "Unused247",
      "Unused248",
      "Unused249",
      "Unused250",
      "Unused251",
      "Unused252",
      "Unused253",
      "Unused264",
      "Unused381",
      "Unused382",
      "Unused387",
      "Unused473",
      "Unused474",
      "Unused475",
      "Unused476",
      "Unused477",
      "Unused478",
      "Unused479",
      "Unused480",
      "Unused481",
      "Unused482",
      "Unused483",
      "Unused484",
      "Unused485",
      "Unused486",
      "Unused487",
      "Unused488",
      "Unused695",
      "Unused696"
  ],
  "10,0,-1": [
      "RampTop"
  ],
  "1,19,-1": [
      "MurkyPool"
  ],
  "9,19,-1": [
      "MurkyPoolRamp"
  ],
  "6,25,-1": [
      "UnderworldGateStairU"
  ],
  "7,25,-1": [
      "UnderworldGateStairD"
  ],
  "8,25,-1": [
      "UnderworldGateStairUD"
  ],
  "4,24,3": [
      "TreeCapInterior",
      "TreeCapWallThickSW",
      "TreeCapWallThickSE",
      "TreeCapWallThickNW",
      "TreeCapWallThickNE",
      "TreeCapWallThickN",
      "TreeCapWallThickS",
      "TreeCapWallThickW",
      "TreeCapWallThickE",
      "TreeCapWallNSWE",
      "TreeCapWallNSW",
      "TreeCapWallNSE",
      "TreeCapWallNWE",
      "TreeCapWallSWE",
      "TreeCapWallNS",
      "TreeCapWallWE",
      "TreeCapPillar"
  ],
  "1,18,-1": [
      "Driftwood"
  ],
  "8,6,-1": [
      "FrozenStairUD"
  ],
  "7,6,-1": [
      "FrozenStairD"
  ],
  "6,6,-1": [
      "FrozenStairU"
  ],
  "4,24,11": [
      "TreeDeadCapInterior",
      "TreeDeadCapWallThickSW",
      "TreeDeadCapWallThickSE",
      "TreeDeadCapWallThickNW",
      "TreeDeadCapWallThickNE",
      "TreeDeadCapWallThickN",
      "TreeDeadCapWallThickS",
      "TreeDeadCapWallThickW",
      "TreeDeadCapWallThickE",
      "TreeDeadCapWallNSWE",
      "TreeDeadCapWallNSW",
      "TreeDeadCapWallNSE",
      "TreeDeadCapWallNWE",
      "TreeDeadCapWallSWE",
      "TreeDeadCapPillar",
      "TreeDeadCapWallNS",
      "TreeDeadCapPillarWE"
  ],
  "0,0,-1": [
      "OpenSpace",
      "Chasm"
  ],
  "15,12,0": [
      "Shrub"
  ],
  "8,4,-1": [
      "LavaStairUD"
  ],
  "7,4,-1": [
      "LavaStairD"
  ],
  "6,4,-1": [
      "LavaStairU"
  ],
  "8,1,-1": [
      "SoilStairUD"
  ],
  "7,1,-1": [
      "SoilStairD"
  ],
  "6,1,-1": [
      "SoilStairU"
  ],
  "0,13,-1": [
      "EeriePit"
  ],
  "1,2,3": [
      "StoneFloorSmooth"
  ],
  "1,4,3": [
      "LavaFloorSmooth"
  ],
  "1,3,3": [
      "FeatureFloorSmooth"
  ],
  "1,5,3": [
      "MineralFloorSmooth"
  ],
  "1,6,3": [
      "FrozenFloorSmooth"
  ],
  "8,8,-1": [
      "Grass1StairUD"
  ],
  "7,8,-1": [
      "Grass1StairD"
  ],
  "6,8,-1": [
      "Grass1StairU"
  ],
  "8,9,-1": [
      "Grass2StairUD"
  ],
  "7,9,-1": [
      "Grass2StairD"
  ],
  "6,9,-1": [
      "Grass2StairU"
  ],
  "8,2,-1": [
      "StoneStairUD"
  ],
  "7,2,-1": [
      "StoneStairD"
  ],
  "6,2,-1": [
      "StoneStairU"
  ],
  "8,5,-1": [
      "MineralStairUD"
  ],
  "7,5,-1": [
      "MineralStairD"
  ],
  "6,5,-1": [
      "MineralStairU"
  ],
  "8,3,-1": [
      "FeatureStairUD"
  ],
  "7,3,-1": [
      "FeatureStairD"
  ],
  "6,3,-1": [
      "FeatureStairU"
  ],
  "5,2,-1": [
      "StoneFortification"
  ],
  "1,14,-1": [
      "Campfire"
  ],
  "1,15,-1": [
      "Fire",
      "BurningTreeCapFloor"
  ],
  "4,15,-1": [
      "BurningTreeTrunk",
      "BurningTreeCapWall"
  ],
  "17,15,-1": [
      "BurningTreeBranches"
  ],
  "19,15,-1": [
      "BurningTreeTwigs"
  ],
  "9,15,-1": [
      "BurningTreeCapRamp"
  ],
  "4,2,3": [
      "StonePillar",
      "StoneWallSmoothRD2",
      "StoneWallSmoothR2D",
      "StoneWallSmoothR2U",
      "StoneWallSmoothRU2",
      "StoneWallSmoothL2U",
      "StoneWallSmoothLU2",
      "StoneWallSmoothL2D",
      "StoneWallSmoothLD2",
      "StoneWallSmoothLRUD",
      "StoneWallSmoothRUD",
      "StoneWallSmoothLRD",
      "StoneWallSmoothLRU",
      "StoneWallSmoothLUD",
      "StoneWallSmoothRD",
      "StoneWallSmoothRU",
      "StoneWallSmoothLU",
      "StoneWallSmoothLD",
      "StoneWallSmoothUD",
      "StoneWallSmoothLR"
  ],
  "4,4,3": [
      "LavaPillar",
      "LavaWallSmoothRD2",
      "LavaWallSmoothR2D",
      "LavaWallSmoothR2U",
      "LavaWallSmoothRU2",
      "LavaWallSmoothL2U",
      "LavaWallSmoothLU2",
      "LavaWallSmoothL2D",
      "LavaWallSmoothLD2",
      "LavaWallSmoothLRUD",
      "LavaWallSmoothRUD",
      "LavaWallSmoothLRD",
      "LavaWallSmoothLRU",
      "LavaWallSmoothLUD",
      "LavaWallSmoothRD",
      "LavaWallSmoothRU",
      "LavaWallSmoothLU",
      "LavaWallSmoothLD",
      "LavaWallSmoothUD",
      "LavaWallSmoothLR"
  ],
  "4,3,3": [
      "FeaturePillar",
      "FeatureWallSmoothRD2",
      "FeatureWallSmoothR2D",
      "FeatureWallSmoothR2U",
      "FeatureWallSmoothRU2",
      "FeatureWallSmoothL2U",
      "FeatureWallSmoothLU2",
      "FeatureWallSmoothL2D",
      "FeatureWallSmoothLD2",
      "FeatureWallSmoothLRUD",
      "FeatureWallSmoothRUD",
      "FeatureWallSmoothLRD",
      "FeatureWallSmoothLRU",
      "FeatureWallSmoothLUD",
      "FeatureWallSmoothRD",
      "FeatureWallSmoothRU",
      "FeatureWallSmoothLU",
      "FeatureWallSmoothLD",
      "FeatureWallSmoothUD",
      "FeatureWallSmoothLR"
  ],
  "4,5,3": [
      "MineralPillar",
      "MineralWallSmoothRD2",
      "MineralWallSmoothR2D",
      "MineralWallSmoothR2U",
      "MineralWallSmoothRU2",
      "MineralWallSmoothL2U",
      "MineralWallSmoothLU2",
      "MineralWallSmoothL2D",
      "MineralWallSmoothLD2",
      "MineralWallSmoothLRUD",
      "MineralWallSmoothRUD",
      "MineralWallSmoothLRD",
      "MineralWallSmoothLRU",
      "MineralWallSmoothLUD",
      "MineralWallSmoothRD",
      "MineralWallSmoothRU",
      "MineralWallSmoothLU",
      "MineralWallSmoothLD",
      "MineralWallSmoothUD",
      "MineralWallSmoothLR"
  ],
  "4,6,3": [
      "FrozenPillar",
      "FrozenWallSmoothRD2",
      "FrozenWallSmoothR2D",
      "FrozenWallSmoothR2U",
      "FrozenWallSmoothRU2",
      "FrozenWallSmoothL2U",
      "FrozenWallSmoothLU2",
      "FrozenWallSmoothL2D",
      "FrozenWallSmoothLD2",
      "FrozenWallSmoothLRUD",
      "FrozenWallSmoothRUD",
      "FrozenWallSmoothLRD",
      "FrozenWallSmoothLRU",
      "FrozenWallSmoothLUD",
      "FrozenWallSmoothRD",
      "FrozenWallSmoothRU",
      "FrozenWallSmoothLU",
      "FrozenWallSmoothLD",
      "FrozenWallSmoothUD",
      "FrozenWallSmoothLR"
  ],
  "1,21,2": [
      "Waterfall"
  ],
  "1,21,1": [
      "RiverSource"
  ],
  "9,22,-1": [
      "TreeRootSloping"
  ],
  "4,22,-1": [
      "TreeRoots"
  ],
  "4,23,3": [
      "TreeTrunkPillar"
  ],
  "9,23,-1": [
      "TreeTrunkSloping"
  ],
  "4,23,-1": [
      "TreeTrunkThickN",
      "TreeTrunkThickS",
      "TreeTrunkThickE",
      "TreeTrunkThickW",
      "TreeTrunkThickNW",
      "TreeTrunkThickNE",
      "TreeTrunkThickSW",
      "TreeTrunkThickSE",
      "TreeTrunkNSE",
      "TreeTrunkNSW",
      "TreeTrunkNEW",
      "TreeTrunkSEW",
      "TreeTrunkNS",
      "TreeTrunkEW",
      "TreeTrunkNSEW",
      "TreeTrunkInterior",
      "TreeTrunkNW",
      "TreeTrunkNE",
      "TreeTrunkSW",
      "TreeTrunkSE",
      "TreeTrunkN",
      "TreeTrunkS",
      "TreeTrunkW",
      "TreeTrunkE"
  ],
  "18,23,-1": [
      "TreeTrunkBranchN",
      "TreeTrunkBranchS",
      "TreeTrunkBranchE",
      "TreeTrunkBranchW"
  ],
  "17,23,-1": [
      "TreeBranchNS",
      "TreeBranchEW",
      "TreeBranchNW",
      "TreeBranchNE",
      "TreeBranchSW",
      "TreeBranchSE",
      "TreeBranches",
      "TreeBranch",
      "TreeBranchNSE",
      "TreeBranchNSW",
      "TreeBranchNEW",
      "TreeBranchSEW",
      "TreeBranchNSEW",
      "TreeBranchS",
      "TreeBranchN",
      "TreeBranchW",
      "TreeBranchE"
  ],
  "17,23,3": [
      "TreeBranchesSmooth"
  ],
  "17,23,11": [
      "TreeDeadBranchesSmooth"
  ],
  "19,23,-1": [
      "TreeTwigs"
  ],
  "9,24,-1": [
      "TreeCapRamp"
  ],
  "4,24,-1": [
      "TreeCapWallN",
      "TreeCapWallS",
      "TreeCapWallE",
      "TreeCapWallW",
      "TreeCapWallNW",
      "TreeCapWallNE",
      "TreeCapWallSW",
      "TreeCapWallSE"
  ],
  "1,24,-1": [
      "TreeCapFloor1",
      "TreeCapFloor2",
      "TreeCapFloor3",
      "TreeCapFloor4"
  ],
  "9,22,6": [
      "TreeDeadRootSloping"
  ],
  "4,22,6": [
      "TreeDeadRoots"
  ],
  "4,23,11": [
      "TreeDeadTrunkPillar"
  ],
  "9,23,6": [
      "TreeDeadTrunkSloping"
  ],
  "4,23,6": [
      "TreeDeadTrunkThickN",
      "TreeDeadTrunkThickS",
      "TreeDeadTrunkThickE",
      "TreeDeadTrunkThickW",
      "TreeDeadTrunkThickNW",
      "TreeDeadTrunkThickNE",
      "TreeDeadTrunkThickSW",
      "TreeDeadTrunkThickSE",
      "TreeDeadTrunkNSE",
      "TreeDeadTrunkNSW",
      "TreeDeadTrunkNEW",
      "TreeDeadTrunkSEW",
      "TreeDeadTrunkNS",
      "TreeDeadTrunkEW",
      "TreeDeadTrunkNSEW",
      "TreeDeadTrunkInterior",
      "TreeDeadTrunkNW",
      "TreeDeadTrunkNE",
      "TreeDeadTrunkSW",
      "TreeDeadTrunkSE",
      "TreeDeadTrunkN",
      "TreeDeadTrunkS",
      "TreeDeadTrunkW",
      "TreeDeadTrunkE"
  ],
  "18,23,6": [
      "TreeDeadTrunkBranchN",
      "TreeDeadTrunkBranchS",
      "TreeDeadTrunkBranchE",
      "TreeDeadTrunkBranchW"
  ],
  "17,23,6": [
      "TreeDeadBranchNS",
      "TreeDeadBranchEW",
      "TreeDeadBranch",
      "TreeDeadBranchNW",
      "TreeDeadBranchNE",
      "TreeDeadBranchSW",
      "TreeDeadBranchSE",
      "TreeDeadBranches",
      "TreeDeadBranchNSE",
      "TreeDeadBranchNSW",
      "TreeDeadBranchNEW",
      "TreeDeadBranchSEW",
      "TreeDeadBranchNSEW",
      "TreeDeadBranchS",
      "TreeDeadBranchN",
      "TreeDeadBranchW",
      "TreeDeadBranchE"
  ],
  "19,23,6": [
      "TreeDeadTwigs"
  ],
  "9,24,6": [
      "TreeDeadCapRamp"
  ],
  "4,24,6": [
      "TreeDeadCapWallN",
      "TreeDeadCapWallS",
      "TreeDeadCapWallE",
      "TreeDeadCapWallW",
      "TreeDeadCapWallNW",
      "TreeDeadCapWallNE",
      "TreeDeadCapWallSW",
      "TreeDeadCapWallSE"
  ],
  "1,24,6": [
      "TreeDeadCapFloor1",
      "TreeDeadCapFloor2",
      "TreeDeadCapFloor3",
      "TreeDeadCapFloor4"
  ],
  "4,2,7": [
      "StoneWallWorn1"
  ],
  "4,2,8": [
      "StoneWallWorn2"
  ],
  "4,2,9": [
      "StoneWallWorn3"
  ],
  "4,2,0": [
      "StoneWall"
  ],
  "14,12,0": [
      "Sapling"
  ],
  "9,10,-1": [
      "GrassDryRamp"
  ],
  "9,11,-1": [
      "GrassDeadRamp"
  ],
  "9,8,-1": [
      "GrassLightRamp"
  ],
  "9,9,-1": [
      "GrassDarkRamp"
  ],
  "9,2,-1": [
      "StoneRamp"
  ],
  "9,4,-1": [
      "LavaRamp"
  ],
  "9,3,-1": [
      "FeatureRamp"
  ],
  "9,5,-1": [
      "MineralRamp"
  ],
  "9,1,-1": [
      "SoilRamp"
  ],
  "1,16,-1": [
      "Ashes1",
      "Ashes2",
      "Ashes3"
  ],
  "9,6,-1": [
      "FrozenRamp"
  ],
  "1,6,0": [
      "FrozenFloor2",
      "FrozenFloor3",
      "FrozenFloor4",
      "FrozenFloor1"
  ],
  "1,1,4": [
      "FurrowedSoil"
  ],
  "4,17,-1": [
      "SemiMoltenRock"
  ],
  "1,17,-1": [
      "MagmaFlow"
  ],
  "4,1,-1": [
      "SoilWall"
  ],
  "4,13,-1": [
      "GlowingBarrier"
  ],
  "1,13,-1": [
      "GlowingFloor"
  ],
  "5,4,-1": [
      "LavaFortification"
  ],
  "5,3,-1": [
      "FeatureFortification"
  ],
  "4,4,7": [
      "LavaWallWorn1"
  ],
  "4,4,8": [
      "LavaWallWorn2"
  ],
  "4,4,9": [
      "LavaWallWorn3"
  ],
  "4,4,0": [
      "LavaWall"
  ],
  "4,3,7": [
      "FeatureWallWorn1"
  ],
  "4,3,8": [
      "FeatureWallWorn2"
  ],
  "4,3,9": [
      "FeatureWallWorn3"
  ],
  "4,3,0": [
      "FeatureWall"
  ],
  "1,2,0": [
      "StoneFloor1",
      "StoneFloor2",
      "StoneFloor3",
      "StoneFloor4"
  ],
  "1,4,0": [
      "LavaFloor1",
      "LavaFloor2",
      "LavaFloor3",
      "LavaFloor4"
  ],
  "1,3,0": [
      "FeatureFloor1",
      "FeatureFloor2",
      "FeatureFloor3",
      "FeatureFloor4"
  ],
  "1,9,-1": [
      "GrassDarkFloor1",
      "GrassDarkFloor2",
      "GrassDarkFloor3",
      "GrassDarkFloor4"
  ],
  "1,1,0": [
      "SoilFloor1",
      "SoilFloor2",
      "SoilFloor3",
      "SoilFloor4"
  ],
  "1,1,5": [
      "SoilWetFloor1",
      "SoilWetFloor2",
      "SoilWetFloor3",
      "SoilWetFloor4"
  ],
  "5,6,-1": [
      "FrozenFortification"
  ],
  "4,6,7": [
      "FrozenWallWorn1"
  ],
  "4,6,8": [
      "FrozenWallWorn2"
  ],
  "4,6,9": [
      "FrozenWallWorn3"
  ],
  "4,6,0": [
      "FrozenWall"
  ],
  "1,21,0": [
      "RiverN",
      "RiverS",
      "RiverE",
      "RiverW",
      "RiverNW",
      "RiverNE",
      "RiverSW",
      "RiverSE"
  ],
  "11,20,-1": [
      "BrookN",
      "BrookS",
      "BrookE",
      "BrookW",
      "BrookNW",
      "BrookNE",
      "BrookSW",
      "BrookSE"
  ],
  "12,20,-1": [
      "BrookTop1",
      "BrookTop2",
      "BrookTop3",
      "BrookTop4"
  ],
  "1,10,-1": [
      "GrassDryFloor1",
      "GrassDryFloor2",
      "GrassDryFloor3",
      "GrassDryFloor4"
  ],
  "14,12,6": [
      "SaplingDead"
  ],
  "15,12,6": [
      "ShrubDead"
  ],
  "1,11,-1": [
      "GrassDeadFloor1",
      "GrassDeadFloor2",
      "GrassDeadFloor3",
      "GrassDeadFloor4"
  ],
  "1,8,-1": [
      "GrassLightFloor1",
      "GrassLightFloor2",
      "GrassLightFloor3",
      "GrassLightFloor4"
  ],
  "2,2,-1": [
      "StoneBoulder"
  ],
  "2,4,-1": [
      "LavaBoulder"
  ],
  "2,3,-1": [
      "FeatureBoulder"
  ],
  "3,2,-1": [
      "StonePebbles1",
      "StonePebbles2",
      "StonePebbles3",
      "StonePebbles4"
  ],
  "3,4,-1": [
      "LavaPebbles1",
      "LavaPebbles2",
      "LavaPebbles3",
      "LavaPebbles4"
  ],
  "3,3,-1": [
      "FeaturePebbles1",
      "FeaturePebbles2",
      "FeaturePebbles3",
      "FeaturePebbles4"
  ],
  "5,5,-1": [
      "MineralFortification"
  ],
  "4,5,7": [
      "MineralWallWorn1"
  ],
  "4,5,8": [
      "MineralWallWorn2"
  ],
  "4,5,9": [
      "MineralWallWorn3"
  ],
  "4,5,0": [
      "MineralWall"
  ],
  "1,5,0": [
      "MineralFloor1",
      "MineralFloor2",
      "MineralFloor3",
      "MineralFloor4"
  ],
  "2,5,-1": [
      "MineralBoulder"
  ],
  "3,5,-1": [
      "MineralPebbles1",
      "MineralPebbles2",
      "MineralPebbles3",
      "MineralPebbles4"
  ],
  "9,21,-1": [
      "RiverRampN",
      "RiverRampS",
      "RiverRampE",
      "RiverRampW",
      "RiverRampNW",
      "RiverRampNE",
      "RiverRampSW",
      "RiverRampSE"
  ],
  "1,7,3": [
      "ConstructedFloor"
  ],
  "5,7,-1": [
      "ConstructedFortification"
  ],
  "4,7,3": [
      "ConstructedPillar",
      "ConstructedWallRD2",
      "ConstructedWallR2D",
      "ConstructedWallR2U",
      "ConstructedWallRU2",
      "ConstructedWallL2U",
      "ConstructedWallLU2",
      "ConstructedWallL2D",
      "ConstructedWallLD2",
      "ConstructedWallLRUD",
      "ConstructedWallRUD",
      "ConstructedWallLRD",
      "ConstructedWallLRU",
      "ConstructedWallLUD",
      "ConstructedWallRD",
      "ConstructedWallRU",
      "ConstructedWallLU",
      "ConstructedWallLD",
      "ConstructedWallUD",
      "ConstructedWallLR"
  ],
  "8,7,-1": [
      "ConstructedStairUD"
  ],
  "7,7,-1": [
      "ConstructedStairD"
  ],
  "6,7,-1": [
      "ConstructedStairU"
  ],
  "9,7,-1": [
      "ConstructedRamp"
  ],
  "1,2,10": [
      "StoneFloorTrackN",
      "StoneFloorTrackS",
      "StoneFloorTrackE",
      "StoneFloorTrackW",
      "StoneFloorTrackNS",
      "StoneFloorTrackNE",
      "StoneFloorTrackNW",
      "StoneFloorTrackSE",
      "StoneFloorTrackSW",
      "StoneFloorTrackEW",
      "StoneFloorTrackNSE",
      "StoneFloorTrackNSW",
      "StoneFloorTrackNEW",
      "StoneFloorTrackSEW",
      "StoneFloorTrackNSEW"
  ],
  "1,4,10": [
      "LavaFloorTrackN",
      "LavaFloorTrackS",
      "LavaFloorTrackE",
      "LavaFloorTrackW",
      "LavaFloorTrackNS",
      "LavaFloorTrackNE",
      "LavaFloorTrackNW",
      "LavaFloorTrackSE",
      "LavaFloorTrackSW",
      "LavaFloorTrackEW",
      "LavaFloorTrackNSE",
      "LavaFloorTrackNSW",
      "LavaFloorTrackNEW",
      "LavaFloorTrackSEW",
      "LavaFloorTrackNSEW"
  ],
  "1,3,10": [
      "FeatureFloorTrackN",
      "FeatureFloorTrackS",
      "FeatureFloorTrackE",
      "FeatureFloorTrackW",
      "FeatureFloorTrackNS",
      "FeatureFloorTrackNE",
      "FeatureFloorTrackNW",
      "FeatureFloorTrackSE",
      "FeatureFloorTrackSW",
      "FeatureFloorTrackEW",
      "FeatureFloorTrackNSE",
      "FeatureFloorTrackNSW",
      "FeatureFloorTrackNEW",
      "FeatureFloorTrackSEW",
      "FeatureFloorTrackNSEW"
  ],
  "1,5,10": [
      "MineralFloorTrackN",
      "MineralFloorTrackS",
      "MineralFloorTrackE",
      "MineralFloorTrackW",
      "MineralFloorTrackNS",
      "MineralFloorTrackNE",
      "MineralFloorTrackNW",
      "MineralFloorTrackSE",
      "MineralFloorTrackSW",
      "MineralFloorTrackEW",
      "MineralFloorTrackNSE",
      "MineralFloorTrackNSW",
      "MineralFloorTrackNEW",
      "MineralFloorTrackSEW",
      "MineralFloorTrackNSEW"
  ],
  "1,6,10": [
      "FrozenFloorTrackN",
      "FrozenFloorTrackS",
      "FrozenFloorTrackE",
      "FrozenFloorTrackW",
      "FrozenFloorTrackNS",
      "FrozenFloorTrackNE",
      "FrozenFloorTrackNW",
      "FrozenFloorTrackSE",
      "FrozenFloorTrackSW",
      "FrozenFloorTrackEW",
      "FrozenFloorTrackNSE",
      "FrozenFloorTrackNSW",
      "FrozenFloorTrackNEW",
      "FrozenFloorTrackSEW",
      "FrozenFloorTrackNSEW"
  ],
  "1,7,10": [
      "ConstructedFloorTrackN",
      "ConstructedFloorTrackS",
      "ConstructedFloorTrackE",
      "ConstructedFloorTrackW",
      "ConstructedFloorTrackNS",
      "ConstructedFloorTrackNE",
      "ConstructedFloorTrackNW",
      "ConstructedFloorTrackSE",
      "ConstructedFloorTrackSW",
      "ConstructedFloorTrackEW",
      "ConstructedFloorTrackNSE",
      "ConstructedFloorTrackNSW",
      "ConstructedFloorTrackNEW",
      "ConstructedFloorTrackSEW",
      "ConstructedFloorTrackNSEW"
  ],
  "9,2,10": [
      "StoneRampTrackN",
      "StoneRampTrackS",
      "StoneRampTrackE",
      "StoneRampTrackW",
      "StoneRampTrackNS",
      "StoneRampTrackNE",
      "StoneRampTrackNW",
      "StoneRampTrackSE",
      "StoneRampTrackSW",
      "StoneRampTrackEW",
      "StoneRampTrackNSE",
      "StoneRampTrackNSW",
      "StoneRampTrackNEW",
      "StoneRampTrackSEW",
      "StoneRampTrackNSEW"
  ],
  "9,4,10": [
      "LavaRampTrackN",
      "LavaRampTrackS",
      "LavaRampTrackE",
      "LavaRampTrackW",
      "LavaRampTrackNS",
      "LavaRampTrackNE",
      "LavaRampTrackNW",
      "LavaRampTrackSE",
      "LavaRampTrackSW",
      "LavaRampTrackEW",
      "LavaRampTrackNSE",
      "LavaRampTrackNSW",
      "LavaRampTrackNEW",
      "LavaRampTrackSEW",
      "LavaRampTrackNSEW"
  ],
  "9,3,10": [
      "FeatureRampTrackN",
      "FeatureRampTrackS",
      "FeatureRampTrackE",
      "FeatureRampTrackW",
      "FeatureRampTrackNS",
      "FeatureRampTrackNE",
      "FeatureRampTrackNW",
      "FeatureRampTrackSE",
      "FeatureRampTrackSW",
      "FeatureRampTrackEW",
      "FeatureRampTrackNSE",
      "FeatureRampTrackNSW",
      "FeatureRampTrackNEW",
      "FeatureRampTrackSEW",
      "FeatureRampTrackNSEW"
  ],
  "9,5,10": [
      "MineralRampTrackN",
      "MineralRampTrackS",
      "MineralRampTrackE",
      "MineralRampTrackW",
      "MineralRampTrackNS",
      "MineralRampTrackNE",
      "MineralRampTrackNW",
      "MineralRampTrackSE",
      "MineralRampTrackSW",
      "MineralRampTrackEW",
      "MineralRampTrackNSE",
      "MineralRampTrackNSW",
      "MineralRampTrackNEW",
      "MineralRampTrackSEW",
      "MineralRampTrackNSEW"
  ],
  "9,6,10": [
      "FrozenRampTrackN",
      "FrozenRampTrackS",
      "FrozenRampTrackE",
      "FrozenRampTrackW",
      "FrozenRampTrackNS",
      "FrozenRampTrackNE",
      "FrozenRampTrackNW",
      "FrozenRampTrackSE",
      "FrozenRampTrackSW",
      "FrozenRampTrackEW",
      "FrozenRampTrackNSE",
      "FrozenRampTrackNSW",
      "FrozenRampTrackNEW",
      "FrozenRampTrackSEW",
      "FrozenRampTrackNSEW"
  ],
  "9,7,10": [
      "ConstructedRampTrackN",
      "ConstructedRampTrackS",
      "ConstructedRampTrackE",
      "ConstructedRampTrackW",
      "ConstructedRampTrackNS",
      "ConstructedRampTrackNE",
      "ConstructedRampTrackNW",
      "ConstructedRampTrackSE",
      "ConstructedRampTrackSW",
      "ConstructedRampTrackEW",
      "ConstructedRampTrackNSE",
      "ConstructedRampTrackNSW",
      "ConstructedRampTrackNEW",
      "ConstructedRampTrackSEW",
      "ConstructedRampTrackNSEW"
  ]
};

const TiletypeShape = [];
TiletypeShape[-1] = "NO_SHAPE";
TiletypeShape[0] = "EMPTY";
TiletypeShape[1] = "FLOOR";
TiletypeShape[2] = "BOULDER";
TiletypeShape[3] = "PEBBLES";
TiletypeShape[4] = "WALL";
TiletypeShape[5] = "FORTIFICATION";
TiletypeShape[6] = "STAIR_UP";
TiletypeShape[7] = "STAIR_DOWN";
TiletypeShape[8] = "STAIR_UPDOWN";
TiletypeShape[9] = "RAMP";
TiletypeShape[10] = "RAMP_TOP";
TiletypeShape[11] = "BROOK_BED";
TiletypeShape[12] = "BROOK_TOP";
TiletypeShape[13] = "TREE_SHAPE";
TiletypeShape[14] = "SAPLING";
TiletypeShape[15] = "SHRUB";
TiletypeShape[16] = "ENDLESS_PIT";
TiletypeShape[17] = "BRANCH";
TiletypeShape[18] = "TRUNK_BRANCH";
TiletypeShape[19] = "TWIG";

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

const TiletypeSpecial = [];
TiletypeSpecial[-1] = "NO_SPECIAL";
TiletypeSpecial[0] = "NORMAL";
TiletypeSpecial[1] = "RIVER_SOURCE";
TiletypeSpecial[2] = "WATERFALL";
TiletypeSpecial[3] = "SMOOTH";
TiletypeSpecial[4] = "FURROWED";
TiletypeSpecial[5] = "WET";
TiletypeSpecial[6] = "DEAD";
TiletypeSpecial[7] = "WORN_1";
TiletypeSpecial[8] = "WORN_2";
TiletypeSpecial[9] = "WORN_3";
TiletypeSpecial[10] = "TRACK";
TiletypeSpecial[11] = "SMOOTH_DEAD";

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

const TiletypeMaterial = [];
TiletypeMaterial[-1] = "NO_MATERIAL";
TiletypeMaterial[0] = "AIR";
TiletypeMaterial[1] = "SOIL";
TiletypeMaterial[2] = "STONE";
TiletypeMaterial[3] = "FEATURE";
TiletypeMaterial[4] = "LAVA_STONE";
TiletypeMaterial[5] = "MINERAL";
TiletypeMaterial[6] = "FROZEN_LIQUID";
TiletypeMaterial[7] = "CONSTRUCTION";
TiletypeMaterial[8] = "GRASS_LIGHT";
TiletypeMaterial[9] = "GRASS_DARK";
TiletypeMaterial[10] = "GRASS_DRY";
TiletypeMaterial[11] = "GRASS_DEAD";
TiletypeMaterial[12] = "PLANT";
TiletypeMaterial[13] = "HFS";
TiletypeMaterial[14] = "CAMPFIRE";
TiletypeMaterial[15] = "FIRE";
TiletypeMaterial[16] = "ASHES";
TiletypeMaterial[17] = "MAGMA";
TiletypeMaterial[18] = "DRIFTWOOD";
TiletypeMaterial[19] = "POOL";
TiletypeMaterial[20] = "BROOK";
TiletypeMaterial[21] = "RIVER";
TiletypeMaterial[22] = "ROOT";
TiletypeMaterial[23] = "TREE_MATERIAL";
TiletypeMaterial[24] = "MUSHROOM";
TiletypeMaterial[25] = "UNDERWORLD_GATE";



const TiletypeVariant = [];
TiletypeVariant[-1] = "NO_VARIANT";
TiletypeVariant[0] = "VAR_1";
TiletypeVariant[1] = "VAR_2";
TiletypeVariant[2] = "VAR_3";
TiletypeVariant[3] = "VAR_4";


const convert =  (tiletype) => {
  let category = tiletype.split(",");
  let shape = TiletypeShape[category[0]];
  let material = TiletypeMaterial[category[1]];
  let special = TiletypeSpecial[category[2]];

  return {
    shape: shape,
    special: special,
    material: material
  }
}

const convertedCategories = [];
for(let category in categories){
  let converted = convert(category);
  converted.name = categories[category];
  converted.key = category;
  convertedCategories.push(converted);
}

//list all shape/material/special combinations
const allCombinations = [];
for(let category in categories){
  let converted = convert(category);
  allCombinations.push(`${converted.shape}-${converted.material}-${converted.special}`);
}
allCombinations.sort();



//write to file
fs.writeFile('convertedCategories.json', JSON.stringify(allCombinations, null, 4), 'utf8', (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});