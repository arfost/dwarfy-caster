const { WebSocketServer } = require("ws");
const { GameServer } = require("../../gameServer/GameServer.js");
const { Stage } = require("./Stage.js");
const DFMapLoader = require("../../GameServer/mapLoader/DFMapLoader.js");

class DFMapStage extends Stage {
  constructor(server) {
    super();
    this.ready = false;

    const mapLoader = new DFMapLoader({
     dfHackConnectionHost: "127.0.0.1",
     dfHackConnectionPort: 5000
    });
    this.gameServer = new GameServer(mapLoader);

    this.server = server;
    const wss = new WebSocketServer({
      server: this.server
    });
  
    wss.on('connection', (ws) => {
      console.log("connected");
      this.gameServer.addPlayer(ws);
    });
    this.lastUpdate = Date.now();

    this.selected = 0;

    this.init();
  }

  async init() {
    console.log("init stage");
    await this.gameServer.init();
    console.log("init stage done");
    this.ready = true;
  }

  menuAction = {
    0:()=>{
      process.exit(0);
    }
  }

  update(input) {
    if(!this.ready){
      return;
    }
    super.update(input);
    const now = Date.now();
    const delta = now - this.lastUpdate;
    this.lastUpdate = now;
    this.gameServer.update(delta);
  }

  reactToInput(input){
    switch(input.name){
      case "z":
      case "up":
        if (this.selected === 0) {
          this.selected = this.menuItems.length - 1;
        } else {
          this.selected--;
        }
      break;
      case "s":
      case "down":
        if (this.selected === this.menuItems.length - 1) {
          this.selected = 0;
        } else {
          this.selected++;
        }
      break;
      case "return":
        this.menuAction[this.selected]();
      break; 
    }
  }

  getDatas() {
    return {
      title: "creative map",
      menu: {
        items: ["close"],
        selected: this.selected
      },
      infoBox: this.ready ? [
        "Press 'return' to quit",
        `map loaded: ${this.gameServer.serverMap.mapLoader.blockToInit.length}/${this.gameServer.serverMap.mapLoader.totalBlockToInit}`,
        `map size: ${this.gameServer.serverMap.mapLoader.mapInfos.size.x}x${this.gameServer.serverMap.mapLoader.mapInfos.size.y}`,
        "",
        "Alternatively, you can open localhost:8080/index.html?cast=12,5 to see the map with the old raycasting renderer",
        "Open a web browser and go to localhost:8080/indexGL.html to see the map",
        "",
        "Welcome to fortress viewer",
      ] : ["loading..."],
      playerList: [
        ...this.gameServer.players.map(p => p.name || p.id),
        "player list : "
      ]
    };
  }

  getComponents() {
    return [
      ["Title", "Menu", "MultiLine", "MultiLine"], 
      [
        {
          name: "title", 
          centered: true,
          border: true,
          pos:{
            x: 0,
            y: 0
          },
          size:{
            width: 100,
            height: 10
          }
        },
        {
          name: "menu",
          pos:{
            x: 0,
            y: 10
          },
          size:{
            width: 20,
            height: 90
          }
        },
        {
          name: "infoBox",
          border: true,
          pos:{
            x: 20,
            y: 10
          },
          size:{
            width: 60,
            height: 90
          }
        },
        {
          name: "playerList",
          border: true,
          pos:{
            x: 80,
            y: 10
          },
          size:{
            width: 20,
            height: 90
          }
        }
      ]
    ];
  }
}

module.exports = { DFMapStage };