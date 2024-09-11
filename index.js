const createServer = require('./src/utils/createServer.js');
const { WebSocketServer } = require("ws");
const { simpleServer } = require('./src/utils/simpleHttpServer.js');
const { GameServer } = require('./src/gameServer/GameServer.js');
const CreativeMapLoader = require('./src/GameServer/mapLoader/CreativeMapLoader.js');
const DFMapLoader = require('./src/GameServer/mapLoader/DFMapLoader.js');

const serverInfos = {
  lastUpdate: Date.now(),
};

const init = async () => {

  const mapLoader = new CreativeMapLoader({});
  console.log(mapLoader.mapInfos);

  // const mapLoader = new DFMapLoader({
  //  dfHackConnectionHost: "127.0.0.1",
  //  dfHackConnectionPort: 5000
  // });


  const gameServer = new GameServer(mapLoader);
  await gameServer.init();

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
    gameServer.addPlayer(ws);
  });

  console.log("starting update");
  setInterval(() => {
    const now = Date.now();
    const delta = now - serverInfos.lastUpdate;
    serverInfos.lastUpdate = now;
    gameServer.update(delta);
  }, 100);
}

init();
