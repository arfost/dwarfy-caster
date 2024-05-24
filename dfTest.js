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
  }

  const testComProcessor = new CommandLineProcessor(testCommands);

  testComProcessor.run();

  console.log("done");
}

init();
