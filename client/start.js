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

  console.log("connection : ", connection.initData.id);

  const startPos = connection.initData.start;

  const player = new Player(startPos);
  const map = new GameMap(connection);
  const controls = new Controls();
  const renderer = new Renderer(display, {width:640, height:360, resolution: 320});
  await renderer.initAssets(connection.initData.assetNames, connection.initData.definitions.tintDefinitions);
  const raycaster = new Raycaster(paramCast ? paramCast : [10, 5]);

  const game = new Game(display);
  game.start((seconds, ctx) => {
    player.update(controls.states, map, seconds);
    map.update(seconds, player);
    renderer.render(player, map, raycaster);
  });
}

initGame();
