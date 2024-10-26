const { MenuStage } = require('./stages/MenuStage');
const { CreaMapStage } = require('./stages/CreaMapStage');
const { DFMapStage } = require('./stages/DFMapStage');
const createServer = require('../utils/createServer.js');
const { simpleServer } = require('../utils/simpleHttpServer.js');

class Game{
  constructor(renderer){
    this.stopped = false;
    this.renderer = renderer;
    this.changeStage({stage:"MenuStage"});

    this.server = createServer(process.argv);
    this.server.on('request', simpleServer);

    this.server.listen(8080, (err) => {
      if (err) {
        console.error("couldn't start server", err);
      } else {
        console.log('Server started on port 8080');
      }
    });
  }

  stop() {
    this.stopped = true;
  }

  get stageList() {
    return [
      "MenuStage",
      "CreaMapStage",
      "DFMapStage",
    ];      
  }

  getStageInstance(name, params) {
    switch (name) {
      case "MenuStage":
        return new MenuStage(params);
      case "CreaMapStage":
        return new CreaMapStage(this.server);
      case "DFMapStage":
        return new DFMapStage(this.server);
      default:
        throw new Error("Stage not found");
    }
  }

  run() {
    this.stopped = false;
    if (this.stopped) {
      return;
    }
    const input = this.renderer.getLastInput();

    this.stage.update(input);
    
    this.renderer.drawScreen(this.stage.getDatas());
    setTimeout(this.run.bind(this), 100);
  }

  changeStage(options) {
    if(this.stageList.includes(options.stage)){
      this.stage = this.getStageInstance(options.stage, options.params);
      this.renderer.prepareScreen(...this.stage.getComponents());
      this.stage.on("changeStage", this.changeStage.bind(this));
    }else{
      throw new Error("Stage not found : "+options.stage);
    }
    console.log("change stage fini")
  }
}

module.exports = { Game };