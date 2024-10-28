export class WebGLRenderer {
  constructor(canvas, resolution) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2');
    if (!this.gl) {
      throw new Error('WebGL 2 not supported');
    }

    // Configuration de base WebGL
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.resolution = resolution;
    this.width = canvas.width = resolution.width;
    this.height = canvas.height = resolution.height;
    
    this.textureCache = new Map();
    this.chunkBuffers = new Map();
    
    this._initShaders();
    this._setupGeometry();
  }

  async initAssets(assetNames, tintDefinitions) {
    this.textures = {};
    
    // Chargement des textures de murs/sols (256x256)
    await Promise.all(
      assetNames.textures.map(async (textureName) => {
        const texture = await this._loadTexture(`assets/textures/${textureName}.png`);
        this.textures[textureName] = texture;
      })
    );

    // Chargement des sprites (64x64)
    this.sprites = {};
    await Promise.all(
      assetNames.sprites.map(async (name) => {
        const texture = await this._loadTexture(`assets/sprites/${name}.png`);
        this.sprites[name] = texture;
      })
    );

    // Préparation des teintes
    this.tintTexture = this._createTintTexture(tintDefinitions);
  }

  _initShaders() {
    // Shader pour les murs
    this.wallProgram = this._createShaderProgram(WALL_VERTEX_SHADER, WALL_FRAGMENT_SHADER);
    
    // Shader pour les sols/plafonds
    this.floorProgram = this._createShaderProgram(FLOOR_VERTEX_SHADER, FLOOR_FRAGMENT_SHADER);
    
    // Shader pour les sprites
    this.spriteProgram = this._createShaderProgram(SPRITE_VERTEX_SHADER, SPRITE_FRAGMENT_SHADER);
    
    // Locations uniformes communes
    this.uniformLocations = {
      wall: this._getUniformLocations(this.wallProgram),
      floor: this._getUniformLocations(this.floorProgram),
      sprite: this._getUniformLocations(this.spriteProgram)
    };
  }

  _getUniformLocations(program) {
    return {
      projection: this.gl.getUniformLocation(program, 'uProjection'),
      view: this.gl.getUniformLocation(program, 'uView'),
      texture: this.gl.getUniformLocation(program, 'uTexture'),
      tintTexture: this.gl.getUniformLocation(program, 'uTintTexture'),
      fogDistance: this.gl.getUniformLocation(program, 'uFogDistance'),
      time: this.gl.getUniformLocation(program, 'uTime')
    };
  }

  async _loadTexture(url) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        
        this.gl.texImage2D(
          this.gl.TEXTURE_2D, 
          0, 
          this.gl.RGBA, 
          this.gl.RGBA, 
          this.gl.UNSIGNED_BYTE, 
          image
        );
        
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        
        resolve(texture);
      };
      image.src = url;
    });
  }

  _createTintTexture(tintDefinitions) {
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    
    const data = new Uint8Array(tintDefinitions.map(tint => {
      return tint ? [tint.red, tint.green, tint.blue, 77] : [0, 0, 0, 0];
    }).flat());
    
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      tintDefinitions.length,
      1,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      data
    );
    
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    
    return texture;
  }

  _setupGeometry() {
    // Buffer pour un quad unitaire (utilisé pour les sprites)
    const quadVertices = new Float32Array([
      -0.5, -0.5,  0.0, 0.0,
       0.5, -0.5,  1.0, 0.0,
       0.5,  0.5,  1.0, 1.0,
      -0.5,  0.5,  0.0, 1.0,
    ]);
    
    const quadIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    
    this.quadVAO = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.quadVAO);
    
    const quadVBO = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, quadVBO);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, quadVertices, this.gl.STATIC_DRAW);
    
    const quadEBO = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, quadEBO);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, quadIndices, this.gl.STATIC_DRAW);
    
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 16, 0);
    this.gl.enableVertexAttribArray(1);
    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 16, 8);
  }

  _createShaderProgram(vertexSource, fragmentSource) {
    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertexShader, vertexSource);
    this.gl.compileShader(vertexShader);

    if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
      throw new Error(this.gl.getShaderInfoLog(vertexShader));
    }

    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragmentShader, fragmentSource);
    this.gl.compileShader(fragmentShader);

    if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
      throw new Error(this.gl.getShaderInfoLog(fragmentShader));
    }

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(this.gl.getProgramInfoLog(program));
    }

    return program;
  }

  _createChunkGeometry(chunkX, chunkY, chunkZ, map) {
    const geometry = new ChunkGeometry(this.gl, map.chunkSize);
    const chunkSize = map.chunkSize;
    
    // Pour chaque cellule du chunk
    for(let k = 0; k < chunkSize; k++) {
      for(let j = 0; j < chunkSize; j++) {
        for(let i = 0; i < chunkSize; i++) {
          const x = chunkX * chunkSize + i;
          const y = chunkY * chunkSize + j;
          const z = chunkZ * chunkSize + k;
          
          const cellType = map.getWall(x, y, z);
          if(cellType <= 0) continue;
          
          const props = map.getCellProperties(cellType);
          if(!props) continue;
          
          // Ajout des murs
          if(props.wallTexture) {
            this._addWallGeometry(
              geometry,
              x, y, z,
              props,
              map.getWallTint(x, y, z),
              props.heightRatio || 1,
              props.thinWall || false
            );
          }
          
          // Ajout du sol
          if(props.floorTexture) {
            this._addFloorGeometry(
              geometry,
              x, y, z,
              props,
              map.getFloorTint(x, y, z)
            );
          }
        }
      }
    }
    
    geometry.update(this.gl);
    return geometry;
  }

  _addWallGeometry(geometry, x, y, z, props, tintIndex, heightRatio, isThinWall) {
    const baseIndex = geometry.vertices.length / 3;
    const height = heightRatio;
    
    if(isThinWall) {
      // Mur fin centré dans la cellule
      geometry.vertices.push(
        [x + 0.5, y, z], [x + 0.5, y + 1, z],
        [x + 0.5, y + 1, z + height], [x + 0.5, y, z + height]
      );
    } else {
      // Face Sud
      geometry.vertices.push(
        [x, y, z], [x + 1, y, z],
        [x + 1, y, z + height], [x, y, z + height]
      );
      
      // Face Nord
      geometry.vertices.push(
        [x + 1, y + 1, z], [x, y + 1, z],
        [x, y + 1, z + height], [x + 1, y + 1, z + height]
      );
      
      // Face Est
      geometry.vertices.push(
        [x + 1, y, z], [x + 1, y + 1, z],
        [x + 1, y + 1, z + height], [x + 1, y, z + height]
      );
      
      // Face Ouest
      geometry.vertices.push(
        [x, y + 1, z], [x, y, z],
        [x, y, z + height], [x, y + 1, z + height]
      );
    }
    
    // Coordonnées de texture pour chaque face
    const texCoords = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for(let i = 0; i < (isThinWall ? 1 : 4); i++) {
      geometry.texCoords.push(...texCoords);
      geometry.tintIndices.push(tintIndex, tintIndex, tintIndex, tintIndex);
    }
    
    // Indices pour chaque face
    for(let i = 0; i < (isThinWall ? 1 : 4); i++) {
      const offset = baseIndex + i * 4;
      geometry.indices.push(
        offset, offset + 1, offset + 2,
        offset, offset + 2, offset + 3
      );
    }
  }

  _addFloorGeometry(geometry, x, y, z, props, tintIndex) {
    const baseIndex = geometry.vertices.length / 3;
    
    // Vertices du sol
    geometry.vertices.push(
      [x, y, z], [x + 1, y, z],
      [x + 1, y + 1, z], [x, y + 1, z]
    );
    
    // Coordonnées de texture
    geometry.texCoords.push(
      [0, 0], [1, 0], [1, 1], [0, 1]
    );
    
    // Indices de teinte
    geometry.tintIndices.push(tintIndex, tintIndex, tintIndex, tintIndex);
    
    // Indices
    geometry.indices.push(
      baseIndex, baseIndex + 1, baseIndex + 2,
      baseIndex, baseIndex + 2, baseIndex + 3
    );
  }

  render(player, map, raycaster) {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    console.log("rendering");
    
    // Mise à jour ou création des buffers de chunks visibles
    const visibleChunks = this._getVisibleChunks(player, map);
    for(const chunk of visibleChunks) {
      const key = `${chunk.x},${chunk.y},${chunk.z}`;
      if(!this.chunkBuffers.has(key)) {
        this.chunkBuffers.set(key, 
          this._createChunkGeometry(chunk.x, chunk.y, chunk.z, map)
        );
      }
    }
    
    // Matrices de vue et projection
    const projection = this._createProjectionMatrix();
    const view = this._createViewMatrix(player);
    
    // Rendu des murs et sols
    this.gl.useProgram(this.wallProgram);
    this.gl.uniformMatrix4fv(this.uniformLocations.wall.projection, false, projection);
    this.gl.uniformMatrix4fv(this.uniformLocations.wall.view, false, view);
    
    for(const chunk of visibleChunks) {
      const key = `${chunk.x},${chunk.y},${chunk.z}`;
      const geometry = this.chunkBuffers.get(key);
      
      this.gl.bindVertexArray(geometry.vao);
      this.gl.drawElements(
        this.gl.TRIANGLES,
        geometry.indices.length,
        this.gl.UNSIGNED_SHORT,
        0
      );
    }
    
    // Rendu des sprites
    // this._renderSprites(player, map, projection, view);
  }

  _renderSprites(player, map, projection, view) {
    const sprites = map.placeables[Math.floor(player.z)] || [];
    if(sprites.length === 0) return;
    
    // Tri des sprites par distance
    const sortedSprites = [...sprites].sort((a, b) => {
      const distA = Math.pow(a.x - player.x, 2) + Math.pow(a.y - player.y, 2);
      const distB = Math.pow(b.x - player.x, 2) + Math.pow(b.y - player.y, 2);
      return distB - distA;
    });
    
    this.gl.useProgram(this.spriteProgram);
    this.gl.uniformMatrix4fv(this.uniformLocations.sprite.projection, false, projection);
    this.gl.uniformMatrix4fv(this.uniformLocations.sprite.view, false, view);
    
    this.gl.bindVertexArray(this.quadVAO);
    
    for(const sprite of sortedSprites) {
      const props = map.getPlaceableProperties(sprite.type);
      const texture = this.sprites[props.sprite];
      if(!texture) continue;
      
      // Matrice modèle pour le sprite
      const model = this._createSpriteMatrix(sprite, player);
      this.gl.uniformMatrix4fv(this.uniformLocations.sprite.model, false, model);
      
      // Rendu du sprite
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.drawElements(
        this.gl.TRIANGLES,
        6,
        this.gl.UNSIGNED_SHORT,
        0
      );
    }
  }

  _getVisibleChunks(player, map) {
    const chunks = [];
    const viewDistance = 2; // En chunks
    
    const playerChunkX = Math.floor(player.x / map.chunkSize);
    const playerChunkY = Math.floor(player.y / map.chunkSize);
    const playerChunkZ = Math.floor(player.z / map.chunkSize);
    
    for(let z = -1; z <= 1; z++) {
      for(let y = -viewDistance; y <= viewDistance; y++) {
        for(let x = -viewDistance; x <= viewDistance; x++) {
          chunks.push({
            x: playerChunkX + x,
            y: playerChunkY + y,
            z: playerChunkZ + z
          });
        }
      }
    }
    
    return chunks;
  }

  _createProjectionMatrix() {
    // Matrice de projection perspective
    const fov = 60 * Math.PI / 180;
    const aspect = this.width / this.height;
    const near = 0.1;
    const far = 100.0;
    
    return this._perspectiveMatrix(fov, aspect, near, far);
  }

  _createViewMatrix(player) {
    // Matrice de vue basée sur la position et direction du joueur
    const lookAt = [
      player.x - player.dirX,
      player.y - player.dirY,
      player.z
    ];
    
    return this._lookAtMatrix(
      [player.x, player.y, player.z],
      lookAt,
      [0, 0, 1 + Math.tan(player.upDirection)]
    );
  }

  _createSpriteMatrix(sprite, player) {
    // Matrice de transformation pour le billboard du sprite
    const matrix = new Float32Array(16);
    // ... Calcul de la matrice de billboard ...
    return matrix;
  }

  // Utilitaires pour les matrices
  _perspectiveMatrix(fov, aspect, near, far) {
    const matrix = new Float32Array(16).fill(0);
    // ... Calcul de la matrice de perspective ...
    matrix[0] = 1 / Math.tan(fov / 2) / aspect;
    matrix[5] = 1 / Math.tan(fov / 2);
    matrix[10] = (far + near) / (near - far);
    matrix[11] = -1;
    matrix[14] = (2 * far * near) / (near - far);
    matrix[15] = 0;


    return matrix;
  }

  _lookAtMatrix(eye, center, up) {
    const matrix = new Float32Array(16);
    // ... Calcul de la matrice lookAt ...
    const f = center.map((c, i) => c - eye[i]);
    const fNorm = Math.sqrt(f.reduce((acc, val) => acc + val * val, 0));
    const fNormalized = f.map(val => val / fNorm);

    const s = fNormalized.map((val, i) => val * up[i] - val * fNormalized[i]);
    const sNorm = Math.sqrt(s.reduce((acc, val) => acc + val * val, 0));
    const sNormalized = s.map(val => val / sNorm);

    const u = sNormalized.map((val, i) => fNormalized[i] * sNormalized[i]);
    matrix[0] = sNormalized[0];
    matrix[1] = u[0];
    matrix[2] = -fNormalized[0];
    matrix[3] = 0;

    matrix[4] = sNormalized[1];
    matrix[5] = u[1];
    matrix[6] = -fNormalized[1];
    matrix[7] = 0;

    matrix[8] = sNormalized[2];
    matrix[9] = u[2];
    matrix[10] = -fNormalized[2];
    matrix[11] = 0;

    matrix[12] = -sNormalized[0] * eye[0] - sNormalized[1] * eye[1] - sNormalized[2] * eye[2];
    matrix[13] = -u[0] * eye[0] - u[1] * eye[1] - u[2] * eye[2];
    matrix[14] = fNormalized[0] * eye[0] + fNormalized[1] * eye[1] + fNormalized[2] * eye[2];
    matrix[15] = 1;
    return matrix;
  }
}

// Vertex Shader pour les murs
const WALL_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in float aTintIndex;

uniform mat4 uProjection;
uniform mat4 uView;

out vec2 vTexCoord;
out float vTintIndex;
out float vFogFactor;

void main() {
    vec4 worldPos = vec4(aPosition, 1.0);
    vec4 viewPos = uView * worldPos;
    gl_Position = uProjection * viewPos;
    
    vTexCoord = aTexCoord;
    vTintIndex = aTintIndex;
    
    // Calcul du brouillard basé sur la distance
    float dist = length(viewPos.xyz);
    vFogFactor = smoothstep(5.0, 15.0, dist);
}`;

// Fragment Shader pour les murs
const WALL_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
in float vTintIndex;
in float vFogFactor;

uniform sampler2D uTexture;
uniform sampler2D uTintTexture;

out vec4 fragColor;

void main() {
    vec4 texColor = texture(uTexture, vTexCoord);
    vec4 tint = texture(uTintTexture, vec2(vTintIndex, 0.0));
    
    // Application de la teinte
    vec3 tintedColor = mix(texColor.rgb, tint.rgb, tint.a);
    
    // Application du brouillard
    vec3 fogColor = vec3(0.0);
    vec3 finalColor = mix(tintedColor, fogColor, vFogFactor);
    
    fragColor = vec4(finalColor, texColor.a);
}`;

// Vertex Shader pour les sols/plafonds
const FLOOR_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in float aTintIndex;

uniform mat4 uProjection;
uniform mat4 uView;

out vec2 vTexCoord;
out float vTintIndex;
out float vFogFactor;

void main() {
    vec4 worldPos = vec4(aPosition, 1.0);
    vec4 viewPos = uView * worldPos;
    gl_Position = uProjection * viewPos;
    
    vTexCoord = aTexCoord;
    vTintIndex = aTintIndex;
    
    float dist = length(viewPos.xyz);
    vFogFactor = smoothstep(5.0, 15.0, dist);
}`;

// Fragment Shader pour les sols/plafonds
const FLOOR_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
in float vTintIndex;
in float vFogFactor;

uniform sampler2D uTexture;
uniform sampler2D uTintTexture;

out vec4 fragColor;

void main() {
    vec4 texColor = texture(uTexture, vTexCoord);
    vec4 tint = texture(uTintTexture, vec2(vTintIndex, 0.0));
    
    vec3 tintedColor = mix(texColor.rgb, tint.rgb, tint.a);
    vec3 fogColor = vec3(0.0);
    vec3 finalColor = mix(tintedColor, fogColor, vFogFactor);
    
    fragColor = vec4(finalColor, texColor.a);
}`;

// Vertex Shader pour les sprites
const SPRITE_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

out vec2 vTexCoord;
out float vFogFactor;

void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vec4 viewPos = uView * worldPos;
    gl_Position = uProjection * viewPos;
    
    vTexCoord = aTexCoord;
    
    float dist = length(viewPos.xyz);
    vFogFactor = smoothstep(5.0, 15.0, dist);
}`;

// Fragment Shader pour les sprites
const SPRITE_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
in float vFogFactor;

uniform sampler2D uTexture;

out vec4 fragColor;

void main() {
    vec4 texColor = texture(uTexture, vTexCoord);
    
    if(texColor.a < 0.1) discard;
    
    vec3 fogColor = vec3(0.0);
    vec3 finalColor = mix(texColor.rgb, fogColor, vFogFactor);
    
    fragColor = vec4(finalColor, texColor.a);
}`;

class ChunkGeometry {
  constructor(gl, chunkSize) {
    this.vertices = [];
    this.indices = [];
    this.texCoords = [];
    this.tintIndices = [];
    this.vertexCount = 0;
    
    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    this.ebo = gl.createBuffer();
  }

  update(gl) {
    gl.bindVertexArray(this.vao);
    
    // Vertex buffer
    const vertexData = new Float32Array([
      ...this.vertices.flat(),
      ...this.texCoords.flat(),
      ...this.tintIndices
    ]);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
    
    // Position attribute
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    
    // TexCoord attribute
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, this.vertices.length * 4);
    
    // TintIndex attribute
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, (this.vertices.length + this.texCoords.length) * 4);
    
    // Index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
  }

  
}