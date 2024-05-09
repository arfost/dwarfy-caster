const { DfMapLoader } = require('./src/mapLoader/DfMapLoader.js');
const { DfHackConnection } = require('./src/dfHackConnection.js');
const createServer = require('./src/utils/createServer.js');
const { WebSocketServer } = require("ws");
const { DummyMapLoader } = require('./src/mapLoader/DummyMapLoader.js');
const { simpleServer } = require('./src/simpleServer.js');

const serverInfos = {
  connectionList: []
};

class Player {
  constructor(ws, start) {
    this.ws = ws;
    this.x = start.x;
    this.y = start.y;
    this.z = start.z;

    this.ws.on('message', this._receiveData.bind(this));
    this.ws.on('close', this._close.bind(this));
    this.ws.on('error', this._error.bind(this));

    this.lastUpdate = Date.now();

    this.seenChunks = [];
    this.seenPlaceablesLvls = [];

  }

  update(mapLoader) {
    if (this.stopUpdate) {
      return;
    }

    //send update every second
    if (Date.now() - this.lastUpdate > 1000) {
      const keys = mapLoader.getChunkKeysForPlayerPosition(this.x, this.y, this.z, 1);
      const filteredKey = keys.filter((key) => !this.seenChunks.includes(key));
      console.log("send", filteredKey.length, "chunks");
      for (let key of filteredKey) {
        this._send({
          type: "mapChunk",
          datas: mapLoader.getChunkForChunkKey(key)
        });
        this.seenChunks.push(key);
      }
      const zLevel = Math.floor(this.z);
      if(!this.seenPlaceablesLvls.includes(zLevel)) {
        console.log("send placeables");
        this._send({
          type: "placeables",
          datas: {
            datas: mapLoader.getPlaceablesForLevel(zLevel),
            isPartial: false,
            zLevel,
          }
        });
        this.seenPlaceablesLvls.push(zLevel);
      }
      this.lastUpdate = Date.now();
    }


  }

  sendHandshake(mapLoader) {
    this._send({
      type: "handshake",
      mapInfos: mapLoader.mapInfos,
      definitions: {
        cellDefinitions: mapLoader.definitions.cellDefinitions,
        placeableDefinitions: mapLoader.definitions.placeableDefinitions,
        tintDefinitions: mapLoader.definitions.tintDefinitions,
        assetNames: mapLoader.definitions.assetNames,
      },
      start: {
        x: this.x,
        y: this.y,
        z: this.z,
      }
    });
  }

  _receiveData(data) {
    const message = JSON.parse(data);
    if (message.type === "stop") {
      console.log("stop update");
      this.stopUpdate = true;
    }
    if (message.type === "position") {
      this.x = message.x;
      this.y = message.y;
      this.z = message.z;
    }
  }

  _close() {
    console.log("closed");
    this.shouldRemove = true;
  }

  _error() {
    console.log("error");
    this.shouldRemove = true;
  }

  _send(data) {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  invalidate() {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send("invalidate");
    }
    this.ws.close();
    this.shouldRemove = true;
  }

}

const update = (mapLoader) => {
  for (let player of serverInfos.connectionList) {
    player.update(mapLoader);
  }
  serverInfos.connectionList = serverInfos.connectionList.filter((player) => !player.shouldRemove);
}

const init = async () => {

  // const df = new DfHackConnection("127.0.0.1", 5000);

  // const mapLoader = new DfMapLoader(df);

  const mapLoader = new DummyMapLoader({ x: 240, y: 240, z: 190 });
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
    } else {
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
