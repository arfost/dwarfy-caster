import { Controls } from './modules/Controls.js';
import { Game } from './modules/Game.js';
import { GameMap } from './modules/GameMap.js';
// import { DefaultMapLoader } from './modules/MapLoader.js';
import { DfMapLoader } from './modules/MapLoader.js';
import { Player } from './modules/Player.js';
import { Raycaster } from './modules/Raycaster.js';
import { Renderer } from './modules/Renderer.js';

async function initGame(){

  const mapLoader = new DfMapLoader();
  // const mapLoader = new DefaultMapLoader(5);
  const startPos = await mapLoader.initMap();

  const display = document.getElementById('display');

  const player = new Player(startPos, Math.PI * 0.3);
  const map = new GameMap(mapLoader, startPos);
  const controls = new Controls();
  const renderer = new Renderer(display, 320);
  await renderer.initTextures();
  const raycaster = new Raycaster(20);

  const game = new Game(display);
  game.start((seconds) => {
    map.update(seconds, player);
    player.update(controls.states, map, seconds);
    renderer.render(player, map, raycaster);
  });
}

initGame();