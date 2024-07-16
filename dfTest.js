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
    mapBlockOnCursor: {
      description: "get the block list from DFHack on the cursor position",
      args: ["filename"],
      callback: async function ({ filename }) {
        try {
          let cursorPos;
          const viewInfos = await dfHackConnection.request("GetViewInfo");
          if (viewInfos.cursorPosX === -30000) {
            cursorPos = {
              x: viewInfos.viewPosX + viewInfos.viewSizeX / 2,
              y: viewInfos.viewPosY + viewInfos.viewSizeY / 2,
              z: viewInfos.viewPosZ
            }
          } else {
            cursorPos = {
              x: viewInfos.cursorPosX,
              y: viewInfos.cursorPosY,
              z: viewInfos.cursorPosZ
            }
          }
          cursorPos.x = Math.floor(cursorPos.x/16);
          cursorPos.y = Math.floor(cursorPos.y/16);
          cursorPos.z = Math.floor(cursorPos.z);
          console.log("cursorPos", cursorPos); 
          const request = await dfHackConnection.request("GetBlockList", { minX: cursorPos.x, minY: cursorPos.y, minZ: cursorPos.z, maxX: cursorPos.x + 1, maxY: cursorPos.y + 1, maxZ: cursorPos.z + 1, forceReload: true });
          writeToFile(filename, JSON.stringify(request, null, 2));
          return ["block list", ...JSON.stringify(request, null, 2).split("\n")];
        } catch (e) {
          return ["block list", "error : " + e.message];
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
