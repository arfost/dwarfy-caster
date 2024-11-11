const { WebSocketServer } = require("ws");
const { GameServer } = require("../../gameServer/GameServer.js");
const CreativeMapLoader = require("../../gameServer/mapLoader/CreativeMapLoader.js");
const { Stage } = require("./Stage.js");

class CreaMapStage extends Stage {
  constructor(server) {
    super();
    this.ready = false;

    const mapLoader = new CreativeMapLoader({});
    console.log(mapLoader.mapInfos);
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

    this.menuItems = ["close"];

    this.selected = 0;

    this.init();
  }

  async init() {

    await this.gameServer.init();
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
        items: this.menuItems,
        selected: this.selected
      },
      infoBox: [
        "Press 'return' to quit",
        "Alternatively, you can open localhost:8080/index.html?cast=12,5 to see the map with the old raycasting renderer",
        "Open a web browser and go to localhost:8080/indexGL.html to see the map",
        "It has no content yet",
        "Welcome to the creative map stage",
      ],
      playerList: [
        ...this.gameServer.players.map(p => p.name || p.id)
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

module.exports = { CreaMapStage };