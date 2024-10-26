const { Renderer } =  require('./src/renderer/Renderer.js') ;
const { Game } = require('./src/game/Game.js');

const renderer = new Renderer();
const game = new Game(renderer);
game.run();

