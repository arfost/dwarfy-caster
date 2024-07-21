import { Controls } from './modules/Controls.js';
import { Game } from './modules/Game.js';
import { GameMap } from './modules/GameMap.js';
// import { DefaultMapLoader } from './modules/MapLoader.js';
import { Player } from './modules/Player.js';
import { Raycaster } from './modules/Raycaster.js';
import { Renderer } from './modules/Renderer.js';
import { SocketConnection } from './modules/SocketConnection.js';

async function initGame() {

  let paramCast = undefined;
  const params = window.location.search.split("=")[1];
  console.log(params);
  if(params){
    try{
      paramCast = params.split(",").map(Number);
      if(paramCast.length !== 2){
        throw new Error("Invalid view params");
      }
    }catch(e){
      console.log("Error parsing view params");
      return;
    }
  }

  const display = document.getElementById('display');
  display.addEventListener("click", async () => {
    if (!document.pointerLockElement) {
      await display.requestPointerLock({
        unadjustedMovement: true,
      });
    }
  });

  const connection = new SocketConnection();
  await connection.ready;

  const startPos = connection.initData.start;

  const player = new Player(startPos);
  const map = new GameMap(connection);
  const controls = new Controls();
  const renderer = new Renderer(display, 320);
  await renderer.initAssets(connection.initData.assetNames);
  const raycaster = new Raycaster(paramCast ? paramCast : [10, 5]);

  const game = new Game(display);
  game.start((seconds, ctx) => {
    player.update(controls.states, map, seconds);
    map.update(seconds, player);
    renderer.render(player, map, raycaster);
    ctx.fillStyle = 'white';
    ctx.fillText(`pos: ${player.x}, ${player.y}, ${player.z}`, 10, 10);
  });
}

initGame();