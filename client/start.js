import { Controls } from './modules/Controls.js';
import { Game } from './modules/Game.js';
import { GameMap } from './modules/GameMap.js';
import { Player } from './modules/Player.js';
import { Raycaster } from './modules/Raycaster.js';
import { Renderer } from './modules/Renderer.js';

async function initGame(){

  
  const display = document.getElementById('display');

  const player = new Player({x:3, y:4, z:0}, Math.PI * 0.3);
  const map = new GameMap(1);
  const controls = new Controls();
  const renderer = new Renderer(display, 320, 90);
  const raycaster = new Raycaster(20);

  const game = new Game(display);
  game.start((seconds, ctx) => {
    renderer.render(player, map, raycaster);
    player.update(controls.states, map, seconds);
    ctx.fillStyle = '#000';
    ctx.fillText(`pos : x:${player.x}, y:${player.y}, z:${player.z}, dir:${player.dirX}-${player.dirY}, upDir:${player.upDirection}`, 50, 26);
  });
}

initGame();