import { UiView } from "../modules/UiView.js";
import { GeometryFactory } from "./GeometryFactory.js";
import { GLAssetsLoader } from "./GLAssetsLoader.js";
import { GLConfiguration } from "./GLConfiguration.js";
import { Model3DRenderer } from "./Model3DRenderer.js";

const FPS_UPDATE_INTERVAL = 500 * 0.001; // Mise à jour toutes les 500ms

const compatible3DModels = ["BED", "BOX", "TABLE", "CHAIR", "STATUE", "CABINET", "COFFIN"];

export class GLRenderer {
  constructor(GLCanvas, uiCanvas, display, map) {
    this.canvas = GLCanvas;
    this.display = display;
    this.gl = this.canvas.getContext('webgl2');
    if (!this.gl) {
      console.error('WebGL2 is not supported');
      return;
    }

    this.glConfig = new GLConfiguration(this.gl);
    this.glAssetsLoader = new GLAssetsLoader(this.gl);

    this.fieldOfView = 45 * Math.PI / 180;
    this.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.zNear = 0.1;
    this.zFar = 100.0;

    this.frameCount = 0;
    this.lastFpsUpdate = 0;

    // Configuration de l'éclairage
    this.lightConfig = {
      radius: 12.0  // Rayon de la lumière
    };

    this.lastPlayerChunkCoords = {
      x: -1,
      y: -1,
      z: -1
    };

    this.chunkBuffersCache = {};
    this.RENDER_DISTANCE = 2;
    this.CHUNK_SIZE = map.chunkSize;
    this.dirtyChunks = false;
    map.cleanChunkBuffer = this._cleanChunkBuffer.bind(this);

    // Création du canvas virtuel pour l'UI

    uiCanvas.width = this.canvas.width;
    uiCanvas.height = this.canvas.height;
    this.uiCtx = uiCanvas.getContext('2d');
    //make the canvas transparent
    uiCanvas.style.backgroundColor = 'rgba(0, 0, 0, 0)';

    this.uiRenderer = new UiView(uiCanvas);

    this.facingCell = { x: 0, y: 0, z: 0 };

    this.liquidBufferCache = new Map();

    this.model3DRenderer = new Model3DRenderer(this.gl);
  }

  async initAssets(assetNames, tintDefinitions) {
    this.spriteTexturesIndex = {};
    for (let i = 0; i < assetNames.sprites.length; i++) {
      this.spriteTexturesIndex[assetNames.sprites[i]] = i;
    }
    this.spriteTextures = await this.glAssetsLoader.loadTextures(assetNames.sprites.map(assetName => `./assets/sprites/${assetName}.png`));

    this.sprite3dTexturesIndex = {};
    let assetFound = 0;
    for (let i = 0; i < assetNames.sprites.length; i++) {
      if(!compatible3DModels.includes(assetNames.sprites[i])) continue;
      this.sprite3dTexturesIndex[assetNames.sprites[i]] = assetFound;
      assetFound++;
    }
    
    const filteredAssetNames = assetNames.sprites.filter(assetName => compatible3DModels.includes(assetName));
    this.sprite3dTextures = await this.glAssetsLoader.loadTextures(filteredAssetNames.map(assetName => `./assets/3dTextures/${assetName}.png`));
    console.log(this.sprite3dTextures, this.sprite3dTexturesIndex);
    this.spriteBuffers = this._createSpriteBuffers(this.gl);

    this.textureIndex = {};
    for (let i = 0; i < assetNames.textures.length; i++) {
      this.textureIndex[assetNames.textures[i]] = i;
    }
    this.blocTextures = await this.glAssetsLoader.loadTextureArray(assetNames.textures.map(assetName => `./assets/textures/${assetName}.png`));
    // normalize tint definitions from 0-255 to 0-1
    this.tintColors = tintDefinitions.map(tintDef => [tintDef.red / 255, tintDef.green / 255, tintDef.blue / 255]);
    this.tintColors[0] = [1, 1, 1]; // Tint 0 is white
  }

  _createSpriteBuffers(gl) {
    const positions = [
      -0.5, 0.0,  // Coin inférieur gauche
      0.5, 0.0,  // Coin inférieur droit
      0.5, 1.0,  // Coin supérieur droit
      -0.5, 1.0,  // Coin supérieur gauche
    ];

    const textureCoordinates = [
      1.0, 1.0,   // Correspondance avec la texture
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
    ];

    const indices = [0, 1, 2, 0, 2, 3];

    // Buffer des positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Buffer des coordonnées de texture
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    // Buffer des indices
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
      textureCoord: textureCoordBuffer,
      indices: indexBuffer,
      count: indices.length,
    };
  }

  _generateChunkBuffers(gl, chunkX, chunkY, chunkZ, map) {
    let geometry = {
      positions: [],
      textureCoordinates: [],
      textureIndices: [],
      colors: [],
      indices: [],
      indexOffset: 0,
    }

    const startX = chunkX * this.CHUNK_SIZE;
    const startY = chunkY * this.CHUNK_SIZE;
    const startZ = chunkZ * this.CHUNK_SIZE;

    for (let z = startZ; z < startZ + this.CHUNK_SIZE; z++) {
      for (let y = startY; y < startY + this.CHUNK_SIZE; y++) {
        for (let x = startX; x < startX + this.CHUNK_SIZE; x++) {
          const block = map.getBlock(x, y, z);
          if (!block) continue;
          if (block.wallTexture) {
            const texIndex = this.textureIndex[block.wallTexture];
            const tintColor = this.tintColors[map.getWallTint(x, y, z)];
            const heightRatio = block.heightRatio || 1;
            if (block.thinWall) {
              geometry = GeometryFactory.getWallGeometry(geometry, x, y, z, texIndex, tintColor, heightRatio, map);
            } else {
              geometry = GeometryFactory.getBlocGeometry(geometry, x, y, z, texIndex, tintColor, heightRatio, map);
            }
          }
          if (block.floorTexture) {
            const texIndex = this.textureIndex[block.floorTexture];
            const tintColor = this.tintColors[map.getFloorTint(x, y, z)];
            geometry = GeometryFactory.getFloorGeometry(geometry, x, y, z, texIndex, tintColor);
          }
        }
      }
    }

    if (geometry.positions.length === 0) {
      return null; // Chunk vide
    }

    // Création des buffers WebGL pour ce chunk
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.textureCoordinates), gl.STATIC_DRAW);

    const textureIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureIndexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(geometry.textureIndices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(geometry.indices), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
      textureCoord: textureCoordBuffer,
      textureIndex: textureIndexBuffer,
      color: colorBuffer,
      indices: indexBuffer,
      count: geometry.indices.length,
    };
  }

  _updateChunksAroundPlayer(playerChunk, map) {
    for (let dx = -this.RENDER_DISTANCE; dx <= this.RENDER_DISTANCE; dx++) {
      for (let dy = -this.RENDER_DISTANCE; dy <= this.RENDER_DISTANCE; dy++) {
        for (let dz = -this.RENDER_DISTANCE; dz <= this.RENDER_DISTANCE; dz++) {
          const chunkX = playerChunk.x + dx;
          const chunkY = playerChunk.y + dy;
          const chunkZ = playerChunk.z + dz;

          const chunkKey = `${chunkX},${chunkY},${chunkZ}`;

          if (!this.chunkBuffersCache[chunkKey]) {
            // Générer les buffers pour ce chunk
            const buffers = this._generateChunkBuffers(this.gl, chunkX, chunkY, chunkZ, map);
            if (buffers) {
              this.chunkBuffersCache[chunkKey] = buffers;
            }
          }
        }
      }
    }

    // Optionnel : supprimer les chunks trop éloignés du cache
    this._removeFarChunksFromCache(playerChunk);
  }

  _cleanChunkBuffer(chunkKey) {
    const buffers = this.chunkBuffersCache[chunkKey];
    if (buffers) {
      this.gl.deleteBuffer(buffers.position);
      this.gl.deleteBuffer(buffers.textureCoord);
      this.gl.deleteBuffer(buffers.textureIndex);
      this.gl.deleteBuffer(buffers.color);
      this.gl.deleteBuffer(buffers.indices);

      delete this.chunkBuffersCache[chunkKey];
    }
    this.dirtyChunks = true;
  }

  _removeFarChunksFromCache(playerChunk) {
    const maxDistance = this.RENDER_DISTANCE + 2; // Un chunk de plus pour la marge

    for (const chunkKey in this.chunkBuffersCache) {
      const [chunkX, chunkY, chunkZ] = chunkKey.split(',').map(Number);
      const dx = chunkX - playerChunk.x;
      const dy = chunkY - playerChunk.y;
      const dz = chunkZ - playerChunk.z;

      if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance || Math.abs(dz) > maxDistance) {
        // Chunk trop éloigné, supprimer les buffers
        this._cleanChunkBuffer(chunkKey);
      }
    }
  }

  _raycastSprite(origin, direction, sprites) {
    let closestSprite = null;
    let minDistance = Infinity;
    const maxDistance = 3; // Utilisation de la taille d'un chunk comme distance maximale

    sprites.forEach(sprite => {
      // Calculer le vecteur entre l'origine du rayon et le sprite
      const dx = sprite.x - origin[0];
      const dy = sprite.y - origin[1];
      const dz = sprite.z - origin[2];

      // Calculer la distance absolue au sprite
      const absoluteDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Si le sprite est plus loin que la taille d'un chunk, on l'ignore
      if (absoluteDistance > maxDistance) return;

      // Calculer la distance du sprite le long du rayon
      const t = dx * direction[0] + dy * direction[1] + dz * direction[2];

      // Si le sprite est derrière le joueur, ignorer
      if (t < 0) return;

      // Calculer le point le plus proche sur le rayon
      const projX = origin[0] + direction[0] * t;
      const projY = origin[1] + direction[1] * t;
      const projZ = origin[2] + direction[2] * t;

      // Calculer la distance entre ce point et le centre du sprite
      const distX = sprite.x - projX;
      const distY = sprite.y - projY;
      const distZ = sprite.z - projZ;

      const distance = Math.sqrt(distX * distX + distY * distY + distZ * distZ);

      // Si la distance est inférieure au rayon de collision du sprite (0.35 = moitié de la largeur)
      if (distance < 0.35) {
        // Si c'est le sprite le plus proche jusqu'à présent
        const rayDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (rayDistance < minDistance) {
          minDistance = rayDistance;
          closestSprite = sprite;
        }
      }
    });

    return closestSprite;
  }

  render(currentTime, player, map, tmpAccessor) {
    currentTime *= 0.001; // Conversion en secondes


    // Calcul des FPS
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= FPS_UPDATE_INTERVAL) {
      const fps = Math.round(this.frameCount / (currentTime - this.lastFpsUpdate));
      this.display.textContent = `FPS: ${fps} |Position: (${player.x.toFixed(2)}, ${player.y.toFixed(2)}, ${player.z.toFixed(2)})`;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }


    const currentPlayerChunkCoords = map.getPlayerChunkCoords(player);
    if (
      currentPlayerChunkCoords.x !== this.lastPlayerChunkCoords.x ||
      currentPlayerChunkCoords.y !== this.lastPlayerChunkCoords.y ||
      currentPlayerChunkCoords.z !== this.lastPlayerChunkCoords.z ||
      this.dirtyChunks
    ) {
      this.lastPlayerChunkCoords = currentPlayerChunkCoords;
      this._updateChunksAroundPlayer(currentPlayerChunkCoords, map);
      this.dirtyChunks = false;
    }

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0.0, 0.0, 0.1, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, this.fieldOfView, this.aspect, this.zNear, this.zFar);
    projectionMatrix[0] *= -1;

    const modelViewMatrix = mat4.create();

    const target = vec3.create();
    vec3.add(target, [player.x, player.y, player.z], player.direction);

    mat4.lookAt(
      modelViewMatrix,
      [player.x, player.y, player.z], // Position de la caméra
      target,                         // Point que regarde la caméra
      player.up                       // Vecteur "up" de la caméra
    );

    // Utilisation du shader program
    this.gl.useProgram(this.glConfig.programInfo.program);

    // Réglage des matrices uniformes
    this.gl.uniformMatrix4fv(this.glConfig.programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.glConfig.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    this.gl.uniform3f(this.glConfig.programInfo.uniformLocations.playerPosition, player.x, player.y, player.z);
    this.gl.uniform1f(this.glConfig.programInfo.uniformLocations.lightRadius, this.lightConfig.radius);

    // Lier le tableau de textures
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.blocTextures);
    this.gl.uniform1i(this.glConfig.programInfo.uniformLocations.uSampler, 0);

    this._drawChunks(this.gl, this.glConfig.programInfo, currentPlayerChunkCoords);

    this._drawLiquids(this.gl, this.glConfig.liquidProgramInfo, currentTime, map, modelViewMatrix, projectionMatrix, player);

    this._drawSprites(this.gl, this.glConfig.spriteProgramInfo, this.spriteBuffers, map, modelViewMatrix, projectionMatrix, player);

    this._updateFacingCell(player);

    let infos;
    if (this.selectedSprite) {
      infos = map.getInfos(this.selectedSprite.id);
    } else {
      infos = map.getInfos(`${this.facingCell.x},${this.facingCell.y},${this.facingCell.z}`);
    }
    this.uiRenderer.updateMessage(infos);

    this.uiCtx.clearRect(0, 0, this.uiRenderer.uiCanvas.width, this.uiRenderer.uiCanvas.height);
    // Dessiner l'UI
    this.uiRenderer.render(player, map, this.facingCell);
    this.uiCtx.drawImage(this.uiRenderer.uiCanvas, 0, 0);

  }

  _updateFacingCell(player) {
    // update facing cell
    this.facingCell.x = Math.floor(player.x - player.dirX);
    this.facingCell.y = Math.floor(player.y - player.dirY);
    this.facingCell.z = Math.floor(player.z);
  }

  _drawSprites(gl, programInfo, buffers, map, modelViewMatrix, projectionMatrix, player) {

    const playerZ = Math.floor(player.z);
    const sprites = map.placeables[playerZ];

    if (!sprites) return;

    this.selectedSprite = this._raycastSprite(
      [player.x, player.y, player.z],
      player.direction,
      sprites
    );

    gl.useProgram(programInfo.program);

    // Configurer les matrices uniformes
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, modelViewMatrix);

    // Configurer les attributs
    // Positions du quad
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      2,          // Taille (x, y)
      gl.FLOAT,
      false,
      0,
      0
    );

    // Coordonnées de texture
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoord,
      2,          // Taille (u, v)
      gl.FLOAT,
      false,
      0,
      0
    );

    // Indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Passer les vecteurs de la caméra au shader
    gl.uniform3fv(programInfo.uniformLocations.uCameraRight, player.right);
    gl.uniform3fv(programInfo.uniformLocations.uCameraUp, player.up);


    // Sauvegarder les matrices actuelles
    const originalModelViewMatrix = mat4.clone(modelViewMatrix);
    const originalProjectionMatrix = mat4.clone(projectionMatrix);

    const Sprites3D = [];
    const Sprites2D = [];

    // Dessiner chaque sprite
    sprites.forEach(sprite => {

      //check if sprite is in the view
      const dx = sprite.x - player.x;
      const dy = sprite.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > this.CHUNK_SIZE) return;

      const placeableInfos = map.getPlaceableProperties(sprite.type);
      if (compatible3DModels.includes(placeableInfos.sprite)) {  // Convention pour identifier les modèles 3D
        Sprites3D.push({
          sprite,
          placeableInfos
        });
      } else {
        Sprites2D.push({
          sprite,
          placeableInfos
        });
      }
    });

    Sprites2D.forEach(({ sprite, placeableInfos }) => {
      // Passer la position du sprite
      gl.uniform3fv(programInfo.uniformLocations.uSpritePosition, [sprite.x, sprite.y, sprite.z]);

      // Passer la taille du sprite
      gl.uniform1f(programInfo.uniformLocations.uSpriteWidth, 0.5* (placeableInfos.width || 1));
      gl.uniform1f(programInfo.uniformLocations.uSpriteHeight, 0.5 * placeableInfos.heightRatio);

      // Lier la texture du sprite
      gl.activeTexture(gl.TEXTURE0);
      const textureIndex = this.spriteTexturesIndex[placeableInfos.sprite];
      gl.bindTexture(gl.TEXTURE_2D, this.spriteTextures[textureIndex]);
      gl.uniform1i(programInfo.uniformLocations.uSpriteSampler, 0);

      gl.uniform1i(
        programInfo.uniformLocations.uIsSelected,
        this.selectedSprite === sprite
      );
      gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0);
    });
    

    Sprites3D.forEach(({ sprite, placeableInfos }) => {
      const rotation = sprite.rotation || (90)*(Math.PI/180);
      const scale = sprite.scale || [1, 1, 1];

      const textureIndex = this.sprite3dTexturesIndex[placeableInfos.sprite];
      this.model3DRenderer.render(
        placeableInfos.sprite,
        [sprite.x, sprite.y, sprite.z],
        rotation,
        scale,
        this.sprite3dTextures[textureIndex],
        this.tintColors[0],
        this.selectedSprite === sprite,
        originalModelViewMatrix,
        originalProjectionMatrix
      );
    });

    
  }

  _drawChunks(gl, programInfo, playerChunk) {

    for (let dx = -this.RENDER_DISTANCE; dx <= this.RENDER_DISTANCE; dx++) {
      for (let dy = -this.RENDER_DISTANCE; dy <= this.RENDER_DISTANCE; dy++) {
        for (let dz = -this.RENDER_DISTANCE; dz <= this.RENDER_DISTANCE; dz++) {
          const chunkX = playerChunk.x + dx;
          const chunkY = playerChunk.y + dy;
          const chunkZ = playerChunk.z + dz;

          const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
          const buffers = this.chunkBuffersCache[chunkKey];

          if (buffers) {
            // Lier les buffers et dessiner le chunk
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
            gl.vertexAttribPointer(
              programInfo.attribLocations.vertexPosition,
              3,          // taille (x, y, z)
              gl.FLOAT,   // type
              false,      // normalisé
              0,          // stride
              0           // offset
            );

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
            gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
            gl.vertexAttribPointer(
              programInfo.attribLocations.textureCoord,
              2,          // taille (u, v)
              gl.FLOAT,   // type
              false,      // normalisé
              0,          // stride
              0           // offset
            );

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureIndex);
            gl.enableVertexAttribArray(programInfo.attribLocations.textureIndex);
            gl.vertexAttribIPointer(
              programInfo.attribLocations.textureIndex,
              1,                // taille (nombre de composantes)
              gl.UNSIGNED_BYTE, // type
              0,                // stride
              0                 // offset
            );

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
            gl.enableVertexAttribArray(programInfo.attribLocations.tintColor);
            gl.vertexAttribPointer(
              programInfo.attribLocations.tintColor,
              3,          // taille (r, g, b)
              gl.FLOAT,   // type
              false,      // normalisé
              0,          // stride
              0           // offset
            );

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

            // Dessiner les éléments
            gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_INT, 0);
          }
        }
      }
    }
  }

  _generateLiquidBuffers(gl, chunkX, chunkY, chunkZ, map) {
    let geometry = {
      positions: [],
      textureCoordinates: [],
      colors: [],
      indices: [],
      indexOffset: 0
    };

    const startX = chunkX * this.CHUNK_SIZE;
    const startY = chunkY * this.CHUNK_SIZE;
    const startZ = chunkZ * this.CHUNK_SIZE;

    for (let z = startZ; z < startZ + this.CHUNK_SIZE; z++) {
      for (let y = startY; y < startY + this.CHUNK_SIZE; y++) {
        for (let x = startX; x < startX + this.CHUNK_SIZE; x++) {
          // Vérifier l'eau
          const waterLevel = map.getCellWater(x, y, z);

          if (waterLevel > 0) {
            const blockEast = map.getBlock(x + 1, y, z);
            const blockWest = map.getBlock(x - 1, y, z);
            const blockNorth = map.getBlock(x, y + 1, z);
            const blockSouth = map.getBlock(x, y - 1, z);
            const blockAbove = map.getBlock(x, y, z + 1);

            const blockEastWater = map.getCellWater(x + 1, y, z);
            const blockWestWater = map.getCellWater(x - 1, y, z);
            const blockNorthWater = map.getCellWater(x, y + 1, z);
            const blockSouthWater = map.getCellWater(x, y - 1, z);

            let faceEast = true;
            let faceWest = true;
            let faceNorth = true;
            let faceSouth = true;
            let faceAbove = true;

            if (blockEast && blockEast.stopView || blockEastWater === waterLevel) {
              faceEast = false;
            }
            if (blockWest && blockWest.stopView || blockWestWater === waterLevel) {
              faceWest = false;
            }
            if (blockNorth && blockNorth.stopView || blockNorthWater === waterLevel) {
              faceNorth = false;
            }
            if (blockSouth && blockSouth.stopView || blockSouthWater === waterLevel) {
              faceSouth = false;
            }
            if (waterLevel === 7 && blockAbove) {
              faceAbove = false;
            }

            geometry = GeometryFactory.getLiquidGeometry(
              geometry,
              x, y, z,
              [0.2, 0.4, 0.8], // Couleur bleue pour l'eau
              waterLevel,
              faceEast, faceWest, faceNorth, faceSouth, faceAbove
            );


          }

          // Vérifier le magma
          const magmaLevel = map.getCellMagma(x, y, z);
          if (magmaLevel > 0) {
            const blockEast = map.getBlock(x + 1, y, z);
            const blockWest = map.getBlock(x - 1, y, z);
            const blockNorth = map.getBlock(x, y + 1, z);
            const blockSouth = map.getBlock(x, y - 1, z);
            const blockAbove = map.getBlock(x, y, z + 1);

            const blockEastWater = map.getCellMagma(x + 1, y, z);
            const blockWestWater = map.getCellMagma(x - 1, y, z);
            const blockNorthWater = map.getCellMagma(x, y + 1, z);
            const blockSouthWater = map.getCellMagma(x, y - 1, z);

            let faceEast = true;
            let faceWest = true;
            let faceNorth = true;
            let faceSouth = true;
            let faceAbove = true;

            if (blockEast && blockEast.stopView || blockEastWater === waterLevel) {
              faceEast = false;
            }
            if (blockWest && blockWest.stopView || blockWestWater === waterLevel) {
              faceWest = false;
            }
            if (blockNorth && blockNorth.stopView || blockNorthWater === waterLevel) {
              faceNorth = false;
            }
            if (blockSouth && blockSouth.stopView || blockSouthWater === waterLevel) {
              faceSouth = false;
            }
            if (waterLevel === 7 && blockAbove) {
              faceAbove = false;
            }

            geometry = GeometryFactory.getLiquidGeometry(
              geometry,
              x, y, z,
              [1, 0.2, 0.1], // Couleur rouge pour le magma
              waterLevel,
              faceEast, faceWest, faceNorth, faceSouth, faceAbove
            );
          }
        }
      }
    }

    if (geometry.positions.length === 0) {
      return null;
    }

    // Création des buffers WebGL
    return {
      position: this._createBuffer(gl, geometry.positions),
      textureCoord: this._createBuffer(gl, geometry.textureCoordinates),
      color: this._createBuffer(gl, geometry.colors),
      indices: this._createIndexBuffer(gl, geometry.indices),
      count: geometry.indices.length
    };
  }

  _createBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW); // Utiliser DYNAMIC_DRAW car les données changent souvent
    return buffer;
  }

  _createIndexBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), gl.DYNAMIC_DRAW);
    return buffer;
  }

  _updateLiquidBuffers(gl, chunkX, chunkY, chunkZ, map) {
    const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
    const buffers = this._generateLiquidBuffers(gl, chunkX, chunkY, chunkZ, map);

    // Si des buffers existaient déjà, les nettoyer
    if (this.liquidBufferCache.has(chunkKey)) {
      const oldBuffers = this.liquidBufferCache.get(chunkKey);
      this._cleanBuffers(gl, oldBuffers);
    }

    this.liquidBufferCache.set(chunkKey, buffers);
    return buffers;
  }

  _cleanBuffers(gl, buffers) {
    if (!buffers) return;
    gl.deleteBuffer(buffers.position);
    gl.deleteBuffer(buffers.textureCoord);
    gl.deleteBuffer(buffers.color);
    gl.deleteBuffer(buffers.indices);
  }

  _drawLiquids(gl, programInfo, currentTime, map, modelViewMatrix, projectionMatrix, player) {
    const playerChunk = map.getPlayerChunkCoords(player);

    gl.useProgram(programInfo.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Configuration des uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniform3f(programInfo.uniformLocations.playerPosition, player.x, player.y, player.z);
    gl.uniform1f(programInfo.uniformLocations.time, currentTime);

    // Rendu des chunks autour du joueur
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const chunkX = playerChunk.x + dx;
          const chunkY = playerChunk.y + dy;
          const chunkZ = playerChunk.z + dz;

          // Mettre à jour ou créer les buffers pour ce chunk
          const buffers = this._updateLiquidBuffers(gl, chunkX, chunkY, chunkZ, map);

          if (buffers) {
            this._bindAndDrawLiquidBuffers(gl, programInfo, buffers);
          }
        }
      }
    }

    gl.disable(gl.BLEND);
  }

  _bindAndDrawLiquidBuffers(gl, programInfo, buffers) {
    // Binding des attributs
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(programInfo.attribLocations.color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.color);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_INT, 0);
  }
}