import { Controls } from './modules/Controls.js';
import { GameMap } from './modules/GameMap.js';
import { SocketConnection } from './modules/SocketConnection.js';
import { GLRenderer } from './modulesGL/GLRenderer.js';
import { Player } from './modulesGL/Player.js';

async function initGame() {
  const GLCanvas = document.querySelector("#glCanvas");
  const uiCanvas = document.querySelector("#uiCanvas");
  function resizeCanvas() {
    GLCanvas.width = window.innerWidth;
    GLCanvas.height = window.innerHeight;
    uiCanvas.width = window.innerWidth;
    uiCanvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const connection = new SocketConnection();
  await connection.ready;

  console.log("connection : ", connection.initData);

  const startPos = connection.initData.start;
  
  const controls = new Controls();
  const player = new Player(startPos);
  const map = new GameMap(connection);

  const renderer = new GLRenderer(GLCanvas, uiCanvas, document.getElementById('fpsCounter'), map);

  uiCanvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  
  uiCanvas.requestPointerLock = uiCanvas.requestPointerLock || uiCanvas.mozRequestPointerLock;
  document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
  
  uiCanvas.onclick = () => {
    uiCanvas.requestPointerLock({
      unadjustedMovement: true
    });
  };

  await renderer.initAssets(connection.initData.assetNames, connection.initData.definitions.tintDefinitions);

  // {
  //   textures: [
  //     'FLOOR_MINERAL',       // ground1
  //     'FLOOR_STONE',     // ground2
  //     'WALL_STONE',        // block1
  //     'WALL_STONE_SMOOTH'       // block2
  //   ],
  //   sprites: [
  //     'DWARF_MALE',
  //     'DWARF_FEMALE',
  //     'GOBELIN_MALE',
  //     'GOBELIN_FEMALE',
  //     'DOG_MALE',
  //     'DOG_FEMALE',
  //     'CORPSEPIECE',
  //     'CHAIR',
  //     'BED',
  //     'BARREL'
  //   ]
  // },[
  //   [1.0, 1.0, 1.0],   // Blanc (pas de teinte)
  //   [1.0, 0.8, 0.8],   // Teinte rouge clair
  //   [0.8, 1.0, 0.8],   // Teinte vert clair
  //   [0.8, 0.8, 1.0],   // Teinte bleu clair
  //   [1.0, 1.0, 0.8],   // Teinte jaune clair
  //   [1.0, 0.8, 1.0],   // Teinte magenta clair
  //   [0.8, 1.0, 1.0],   // Teinte cyan clair
  //   [0.9, 0.9, 0.9]    // Gris clair
  //   // ... ajoutez d'autres teintes si nécessaire
  // ]
  
  let lastTimestamp = 0;

  function frame(seconds) {
    const deltaTime = seconds - lastTimestamp;
    lastTimestamp = seconds;
    player.update(controls.states, deltaTime* 0.001);
    map.update(deltaTime * 0.001, player);
    renderer.render(seconds, player, map);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}




initGame();









//randomly add 1000 sprites with texture index 0 to 10
// for(let i = 0; i < 1000; i++) {
//   sprites.push({
//     position: [Math.random() * 256, Math.random() * 256, Math.random() * 256],
//     textureIndex: Math.floor(Math.random() * 10),
//     width: 0.7,
//     height: 0.7
//   });
// }


function setBlock(x, y, z, type, tintIndex = 0, heightRatio = 1.0) {
  map[z][y * mapSize.x + x] = { type, tintIndex, heightRatio };
  // Invalider les buffers du chunk
  const chunkX = Math.floor(x / CHUNK_SIZE);
  const chunkY = Math.floor(y / CHUNK_SIZE);
  const chunkZ = Math.floor(z / CHUNK_SIZE);
  const chunkKey = `${chunkX},${chunkY},${chunkZ}`;

  if (chunkBuffersCache[chunkKey]) {
      // Supprimer les buffers existants
      const buffers = chunkBuffersCache[chunkKey];
      gl.deleteBuffer(buffers.position);
      gl.deleteBuffer(buffers.textureCoord);
      gl.deleteBuffer(buffers.textureIndex);
      gl.deleteBuffer(buffers.color);
      gl.deleteBuffer(buffers.indices);

      delete chunkBuffersCache[chunkKey];
  }
}

// Fonction pour obtenir le type de bloc à une position donnée


// const LOAD_RADIUS = 20; // Rayon en unités autour du joueur



function rayCast(position, direction, maxDistance = 5) {
  const startOffset = 0.1;
  let px = position[0] + direction[0] * startOffset;
  let py = position[1] + direction[1] * startOffset;
  let pz = position[2] + direction[2] * startOffset;

  const dx = direction[0];
  const dy = direction[1];
  const dz = direction[2];

  const step = 0.05;
  const steps = maxDistance / step;

  let lastEmpty = null;
  let lastX = Math.floor(px);
  let lastY = Math.floor(py);
  let lastZ = Math.floor(pz);

  for (let i = 0; i < steps; i++) {
    px += dx * step;
    py += dy * step;
    pz += dz * step;

    const x = Math.floor(px);
    const y = Math.floor(py);
    const z = Math.floor(pz);

    if (x !== lastX || y !== lastY || z !== lastZ) {
      if (getBlock(lastX, y, lastZ) !== 2) {
        lastEmpty = [lastX, y, lastZ];
      }
      lastX = x;
      lastY = y;
      lastZ = z;
    }

    if (getBlock(x, y, z) !== 0) {
      return {
        hit: true,
        position: [x, y, z],
        previous: lastEmpty,
        distance: i * step
      };
    }
  }

  return { hit: false };
}


