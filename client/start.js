import { Controls } from './modules/Controls.js';
import { Game } from './modules/Game.js';
import { RendererCanvas } from './modules/RendererCanvas.js';

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

  const controls = new Controls();
  const renderer = new RendererCanvas(display, 320);

  const game = new Game(display, renderer, controls, {paramCast});
  await game.ready;
  game.start();
}

initGame();