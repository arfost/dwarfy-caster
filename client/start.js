import { Controls } from './modules/Controls.js';
import { Game } from './modules/Game.js';
import { GameMap } from './modules/GameMap.js';
import { DefaultMapLoader } from './modules/MapLoader.js';
// import { DfMapLoader } from './modules/MapLoader.js';
import { Player } from './modules/Player.js';
import { Raycaster } from './modules/Raycaster.js';
import { Renderer } from './modules/Renderer.js';

async function initGame() {

  let paramStartPos = undefined;
  const params = window.location.search.split("=")[1];
  console.log(params);
  if(params){
    try{
      const [x, y, z] = params.split(",").map(Number);
      paramStartPos = {x, y, z};
    }catch(e){
      console.log("Error parsing start position");
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

  const player = new Player(paramStartPos ? paramStartPos : startPos, Math.PI * 0.3);
  const map = new GameMap(mapLoader, paramStartPos ? paramStartPos : startPos);
  const controls = new Controls();
  const renderer = new Renderer(display, 320);
  await renderer.initTextures();
  const raycaster = new Raycaster(20);

  const game = new Game(display);
  game.start((seconds, ctx) => {
    map.update(seconds, player);
    player.update(controls.states, map, seconds);
    renderer.render(player, map, raycaster);
    ctx.fillStyle = '#ff6600';
    ctx.fillText(`x:${player.x}, y:${player.y}, z:${player.z}`, 10, 50);
  });
}

initGame();