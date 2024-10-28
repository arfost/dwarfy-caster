const { Stage } = require("./Stage.js");
const gameName = "DwarfyCaster";

const infoTextBase = {
  infos:[
    "Welcome to DwarfyCaster, a 3D real-time map viewer for Dwarf Fortress.",
    "Use the arrow keys to navigate this menu and press enter to select an option.",
  ],
  startDFMap:[
    "Start to explore a Dwarf Fortress map.",
    "You will need to have DFHack running and the DFHack connection enabled.",
    "DFHack is a simple and handy tool that allows you to improve your Dwarf Fortress experience.",
    "You can find more infos at https://docs.dfhack.org/ or directly on steam.",
    "You will also need to have the map loaded in Dwarf Fortress.",
    "Press enter to start.",
  ],
  startCreaMap:[
    "Start to creative map.",
    "This is a test map to allow me to explore new feature more easily, it has no other points.",
    "Press enter to start.",
  ],
  exit:[
    "Exit the program.",
    "Press enter to exit.",
  ]
}

class MenuStage extends Stage {
  constructor() {
    super();
    this.selected = 0;
    this.menuItems = ["infos", "start DF map", "start Crea map", "Exit"];
    this.indexToInfoName = [
      "infos",
      "startDFMap",
      "startCreaMap",
      "exit"
    ]
  }

  menuAction = {
    0:()=>{
      this.emit("changeStage", {stage: "InfosStage"});
    },
    1:()=>{
      this.emit("changeStage", {stage: "DFMapStage"});
    },
    2:()=>{
      this.emit("changeStage", {stage: "CreaMapStage"});
    },
    3:()=>{
      process.exit(0);
    }
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
      title: gameName,
      menu: {
        items: this.menuItems,
        selected: this.selected
      },
      infoBox: [
        ...infoTextBase[this.indexToInfoName[this.selected]],
      ]
    };
  }

  getComponents() {
    return [
      ["Title", "Menu", "MultiLine"], 
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
          centered: true,
          hCentered: true,
          pos:{
            x: 0,
            y: 10
          },
          size:{
            width: 40,
            height: 90
          }
        },
        {
          name: "infoBox",
          border: true,
          pos:{
            x: 40,
            y: 10
          },
          size:{
            width: 60,
            height: 90
          }
        }
      ]
    ];
  }
}

module.exports = { MenuStage };