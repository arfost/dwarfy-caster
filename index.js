const { PermaDfMapLoader } = require('./src/mapLoader/PermaDfMapLoader.js');
const { DfHackConnection } = require('./src/dfHackConnection.js');
const createServer = require('./src/utils/createServer.js');
const { WebSocketServer } = require("ws");
const { DummyMapLoader } = require('./src/mapLoader/DummyMapLoader.js');
const { simpleServer } = require('./src/utils/simpleHttpServer.js');

const serverInfos = {
  connectionList: [],
  lastUpdate: Date.now(),
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

    this.lastUpdate = 10000;

    this.lastRTUpdate = 0;
    this.rtUpateTick = 0;

    this.seenChunks = [];
    this.seenPlaceablesLvls = [];

  }

  update(mapLoader, seconds) {
    if (this.stopUpdate) {
      return;
    }

    this.rtUpateTick++
    this._send({
      type: "RTLayers",
      datas: {
        pos: { x: this.x, y: this.y, z: this.z },
        water: mapLoader.getRTLayerInfosForPosition("water", this.x, this.y, this.z),
        magma: mapLoader.getRTLayerInfosForPosition("magma", this.x, this.y, this.z),
      }
    });
    const keys = mapLoader.getChunkKeysForPlayerPosition(this.x, this.y, this.z);
    const filteredKey = keys.filter((key) => !this.seenChunks.includes(key));
    for (let key of filteredKey) {
      console.log("sending chunk", key);
      this._send({
        type: "mapChunk",
        datas: mapLoader.getChunkForChunkKey(key)
      });
      if (key.split(':')[1] !== "0") {
        this.seenChunks.push(key);
      }
    }
    const zLevel = Math.floor(this.z);
    this._send({
      type: "placeables",
      datas: {
        zLevel,
        datas: mapLoader.getPlaceablesForLevel(zLevel)
      }
    });
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
      this.z = Math.floor(message.z);
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
  const now = Date.now();
  const seconds = (now - serverInfos.lastUpdate) / 1000;
  serverInfos.lastUpdate = now;
  for (let player of serverInfos.connectionList) {
    player.update(mapLoader, seconds);
  }
  serverInfos.connectionList = serverInfos.connectionList.filter((player) => !player.shouldRemove);
  mapLoader.update(serverInfos.connectionList, seconds);
}

const init = async () => {

  const df = new DfHackConnection("127.0.0.1", 5000);

  const mapLoader = new PermaDfMapLoader(df);

  // const mapLoader = new DummyMapLoader({ x: 240, y: 240, z: 190 });
  const start = await mapLoader.ready();

  console.log(mapLoader.mapInfos, start);

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

  console.log("starting update");
  setInterval(() => {
    //process.exit();
    update(mapLoader);
  }, 100);
}

init();
