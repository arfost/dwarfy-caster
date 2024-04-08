import { Controls } from './modules/Controls.js';
import { Game } from './modules/Game.js';
import { GameMap } from './modules/GameMap.js';
import { DefaultMapLoader } from './modules/MapLoader.js';
// import { DfMapLoader } from './modules/MapLoader.js';
import { Player } from './modules/Player.js';
import { Raycaster } from './modules/Raycaster.js';
import { Renderer } from './modules/Renderer.js';

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

  // const mapLoader = new DfMapLoader();
  const mapLoader = new DefaultMapLoader(5);
  const startPos = await mapLoader.initMap();

  const display = document.getElementById('display');
  display.addEventListener("click", async () => {
    if (!document.pointerLockElement) {
      await display.requestPointerLock({
        unadjustedMovement: true,
      });
    }
  });

  const player = new Player(startPos, Math.PI * 0.3);
  const map = new GameMap(mapLoader, startPos);
  const controls = new Controls();
  const renderer = new Renderer(display, 320);
  await renderer.initTextures(mapLoader.definitions.assetNames);
  const raycaster = new Raycaster(paramCast ? paramCast : [10, 5]);

  const game = new Game(display);
  game.start((seconds, ctx) => {
    map.update(seconds, player);
    player.update(controls.states, map, seconds);
    renderer.render(player, map, raycaster);
    ctx.fillStyle = 'white';
    ctx.fillText(`pos: ${player.x}, ${player.y}, ${player.z}`, 10, 10);
  });
}

initGame();