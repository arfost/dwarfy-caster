import { GameMap } from "./GameMap.js";
import { Player } from "./Player.js";
import { Raycaster } from "./Raycaster.js";
import { RendererWorker } from "./RendererWorker.js";
import { SocketConnection } from "./SocketConnection.js";

console.log("hello from worker");

const switchListener = async (settings)=>{
  removeEventListener('message', initListener);
  const update = await initGame(settings);
  console.log("switch listener", update);
  addEventListener('message', update);
} 

const initListener = ({data})=>{
  console.log("init listener", data);
  if(data.type === 'init'){
    switchListener(data.settings);
  }
}

addEventListener('message', initListener);

async function initGame(settings) {
  console.log("init game logic : ", settings);
  let connection = new SocketConnection();
  await connection.ready;

  const player = new Player(connection);
  const map = new GameMap(connection);

  console.log("init game logic : ", connection.initData);

  postMessage({type:'init', definitions: connection.initData.definitions})

  const renderer = new RendererWorker(settings.renderSettings);
  const raycaster = new Raycaster(settings.paramCast ? settings.paramCast : [10, 5]);

  return (e)=>{
    player.update(e.data, map, 1/60);
    const renderInstruction = renderer.render(player, map, raycaster);
    postMessage(renderInstruction);
  };
}