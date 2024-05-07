const { DfMapLoader } = require('./src/mapLoader/DfMapLoader.js');
const { DfHackConnection } = require('./src/dfHackConnection.js');
const createServer = require('./src/utils/createServer.js');
const { WebSocketServer } = require("ws");
const { DummyMapLoader } = require('./src/mapLoader/DummyMapLoader.js');
const { simpleServer } = require('./src/simpleServer.js');

const serverInfos = {
  connectionList: []
};

class Player{
  constructor(ws, start){
    this.ws = ws;
    this.x = start.x;
    this.y = start.y;
    this.z = start.z;

    this.ws.on('message', this._receiveData.bind(this));
    this.ws.on('close', this._close.bind(this));
    this.ws.on('error', this._error.bind(this));

  }

  update(mapLoader){
    if(this.stopUpdate){
      return;
    }
    this.ws.send(JSON.stringify({
      type: "update",
      x: this.x,
      y: this.y,
      z: this.z,
      map: mapLoader.map,
      placeables: mapLoader.placeables,
    }));
  }

  sendHandshake(mapLoader){
    this.ws.send(JSON.stringify({
      type: "handshake",
      mapInfos: mapLoader.mapInfos,
      definitions: {
        cellDefinitions: mapLoader.definitions.cellDefinitions,
        placeableDefinitions: mapLoader.definitions.placeableDefinitions,
        assetNames: mapLoader.definitions.assetNames,
      },
      x: this.x,
      y: this.y,
      z: this.z,
    }));
  }

  _receiveData(data){
    console.log("received", data);
    const message = JSON.parse(data);
    if(message.type === "stop"){
      console.log("stop update");
      this.stopUpdate = true;
    }
    if(message.type === "move"){
      this.x = message.x;
      this.y = message.y;
      this.z = message.z;
    }
  }

  _close(){
    console.log("closed");
    this.shouldRemove = true;
  }

  _error(){
    console.log("error");
    this.shouldRemove = true;
  }

  invalidate(){
    if(this.ws.readyState === this.ws.OPEN){
      this.ws.send("invalidate");
    }
    this.ws.close();
    this.shouldRemove = true;
  }

}

const update = (mapLoader) => {
  for(let player of serverInfos.connectionList){
    player.update(mapLoader);
  }
  serverInfos.connectionList = serverInfos.connectionList.filter((player) => !player.shouldRemove);
}

const init = async () => {

  // const df = new DfHackConnection("127.0.0.1", 5000);

  // const mapLoader = new DfMapLoader(df);

  const mapLoader = new DummyMapLoader({x:240, y: 240, z:190});
  const start = await mapLoader.ready();

  console.log(mapLoader.mapInfos, start);

  mapLoader.loadChunk(3, 3, 153, 5, true);

  const server = createServer(process.argv);
  const wss = new WebSocketServer({
    server
  });
  server.on('request', simpleServer);

  server.listen(8080, (err) => {
    if (err) {
      console.error("couldn't start server", err);
    }else{
      console.log('Server started on port 8080');
    }
  });

  wss.on('connection', function connection(ws) {
    console.log("connected");
    const player = new Player(ws, start);
    player.sendHandshake(mapLoader);
    serverInfos.connectionList.push(player);
  });

  setInterval(() => {
    update(mapLoader);
  }, 1000);
}

init();
