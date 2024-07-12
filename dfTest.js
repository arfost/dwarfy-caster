const { CommandLineProcessor } = require("./src/utils/CommandProcessor.js");
const { DfHackConnection } = require('./src/dfHackConnection.js');

//function to write to a file
const fs = require('fs');
function writeToFile(fileName, data) {
  fs.writeFileSync(fileName+".json", data);
}


async function init() {
  const dfHackConnection = new DfHackConnection("127.0.0.1", 5000);
  await dfHackConnection.ready;

  const testCommands = {
    viewInfos: {
      description: "get the view infos from DFHack",
      args: [],
      callback: async function (args) {
        try {
          const request = await dfHackConnection.request("GetViewInfo");
          return ["cursor position", ...JSON.stringify(request, null, 2).split("\n")];
        } catch (e) {
          return ["cursor position", "error : " + e.message];
        }
      }
    },
    unitList: {
      description: "get the unit list from DFHack",
      args: ["filename"],
      callback: async function (args) {
        try {
          const request = await dfHackConnection.request("GetUnitList");
          writeToFile(args.filename, JSON.stringify(request, null, 2));
          return ["unit list", ...JSON.stringify(request, null, 2).split("\n")];
        } catch (e) {
          return ["unit list", "error : " + e.message];
        }
      }
    },
    mapBlock: {
      description: "get the block list from DFHack",
      args: ["x", "y", "z", "filename"],
      callback: async function ({ x, y, z, filename }) {
        //parse args
        x = parseInt(x);
        y = parseInt(y);
        z = parseInt(z);
        const params = { minX: x, minY: y, minZ: z, maxX: x + 1, maxY: y + 1, maxZ: z+1, forceReload: true };
        try {
          const request = await dfHackConnection.request("GetBlockList", params);
          writeToFile(filename, JSON.stringify(request, null, 2));
          return ["block list", ...JSON.stringify(request, null, 2).split("\n")];
        } catch (e) {
          return ["block list", "error : " + e.message];
        }
      }
    },
    testBuildingsSmall: {
      description: "get the block list from DFHack",
      args: [],
      callback: async function () {
        //parse args
        x = 3;
        y = 6;
        z = 153;
        const params = { minX: x, minY: y, minZ: z, maxX: x + 1, maxY: y + 1, maxZ: z+1, forceReload: true };
        try {
          const request = await dfHackConnection.request("GetBlockList", params);
          const buildings = request.mapBlocks[0].buildings.filter(b => !!b.buildingType);
          writeToFile("testBuildingsSmall", JSON.stringify(buildings, null, 2));
          return ["buildings list", ...JSON.stringify(buildings, null, 2).split("\n")];
        } catch (e) {
          return ["buildings list", "error : " + e.message];
        }
      }
    },
    testBuildingsBig: {
      description: "get the block list from DFHack",
      args: [],
      callback: async function () {
        //parse args
        x = 3;
        y = 6;
        z = 153;
        const params = { minX: x - 1, minY: y - 1, minZ: z, maxX: x + 2, maxY: y + 2, maxZ: z+1, forceReload: true };
        try {
          const request = await dfHackConnection.request("GetBlockList", params);
          const buildings = request.mapBlocks[0].buildings.filter(b => !!b.buildingType);
          writeToFile("testBuildingsBig", JSON.stringify(buildings, null, 2));
          return ["buildings list", ...JSON.stringify(buildings, null, 2).split("\n")];
        } catch (e) {
          return ["buildings list", "error : " + e.message];
        }
      }
    },
    testConcurence: {
      description: "launch multiple request at the same time",
      args: [],
      callback: async function () {
        //parse args
        x = 3;
        y = 6;
        z = 153;
        const params = { minX: x, minY: y, minZ: z, maxX: x + 1, maxY: y + 1, maxZ: z+1, forceReload: true };
        try {
          const requests = await Promise.all([
            dfHackConnection.request("GetBlockList", params),
            dfHackConnection.request("GetUnitList")
          ]);
          const request = requests[0];
          console.log("first request done", request.mapBlocks.length);
          const request2 = requests[1];
          console.log("second request done", request2.creatureList.length);
          
          return ["test fait"];
        } catch (e) {
          return ["testPatial list", "error : " + e.message];
        }
      }
    },
  }

  const testComProcessor = new CommandLineProcessor(testCommands);

  testComProcessor.run();

  console.log("done");
}

init();
