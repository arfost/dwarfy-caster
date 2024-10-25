const blockVertexShader = `#version 300 es
            precision mediump float;

            in vec4 aVertexPosition;
            in vec2 aTextureCoord;
            in uint aTextureIndex;
            in vec3 aTintColor;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            out vec2 vTextureCoord;
            flat out uint vTextureIndex;
            out vec3 vTintColor;
            out vec3 vFragPosition;

            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vTextureCoord = aTextureCoord;
                vTextureIndex = aTextureIndex;
                vTintColor = aTintColor;
                vFragPosition = aVertexPosition.xyz;
            }`;
const blockFragmentShader = `#version 300 es
            precision mediump float;

            in vec2 vTextureCoord;
            flat in uint vTextureIndex;
            in vec3 vTintColor;
            in vec3 vFragPosition;

            uniform vec3 uPlayerPosition;
            uniform float uLightRadius;
            uniform mediump sampler2DArray uSampler;

            out vec4 fragColor;

            void main(void) {
                vec4 texColor = texture(uSampler, vec3(vTextureCoord, float(vTextureIndex)));
                
                // Si la transparence est trop faible, rejeter le fragment
                if (texColor.a < 0.1) discard;
                
                float distance = length(vFragPosition - uPlayerPosition);
                float attenuation = clamp(1.0 - (distance / uLightRadius), 0.0, 1.0);
                vec3 finalColor = texColor.rgb * vTintColor * attenuation;
                
                // Préserver l'alpha d'origine de la texture
                fragColor = vec4(finalColor, texColor.a);
            }`;

const spriteVertexShader = `#version 300 es
          precision mediump float;

          in vec2 aVertexPosition; // Coordonnées du quad
          in vec2 aTextureCoord;

          uniform mat4 uProjectionMatrix;
          uniform mat4 uViewMatrix;
          uniform vec3 uSpritePosition;
          uniform vec3 uCameraRight;
          uniform vec3 uCameraUp;
          uniform float uSpriteWidth;
          uniform float uSpriteHeight;

          out vec2 vTextureCoord;

          void main(void) {
              // Calcul de l'offset en fonction de la taille du sprite
              vec3 offset = aVertexPosition.x * uSpriteWidth * uCameraRight +
                            aVertexPosition.y * uSpriteHeight * uCameraUp;

              vec3 worldPosition = uSpritePosition + offset;

              gl_Position = uProjectionMatrix * uViewMatrix * vec4(worldPosition, 1.0);
              vTextureCoord = aTextureCoord;
          }`;
const spriteFragmentShader = `#version 300 es
          precision mediump float;

          in vec2 vTextureCoord;

          uniform sampler2D uSpriteSampler;
          uniform bool uIsSelected;  // Nouveau uniform pour la sélection

          out vec4 fragColor;

          void main(void) {
              vec4 texColor = texture(uSpriteSampler, vTextureCoord);
              if (texColor.a < 0.1) discard;
              
              if (uIsSelected) {
                // Ajouter un effet de surbrillance
                vec3 highlightColor = texColor.rgb * 1.5 + vec3(0.2);
                fragColor = vec4(highlightColor, texColor.a);
              } else {
                fragColor = texColor;
              }
          }`;

const liquidVertexShader = `#version 300 es
          precision mediump float;
          
          in vec4 aVertexPosition;
          in vec2 aTextureCoord;
          in vec3 aColor;
          
          uniform mat4 uModelViewMatrix;
          uniform mat4 uProjectionMatrix;
          uniform float uTime;
          
          out vec2 vTextureCoord;
          out vec3 vColor;
          out vec3 vFragPosition;
          
          void main(void) {
              // Effet de vague simple
              vec4 position = aVertexPosition;
              float wave = sin(uTime * 2.0 + position.x * 4.0 + position.y * 4.0) * 0.02;
              position.z += wave;
          
              gl_Position = uProjectionMatrix * uModelViewMatrix * position;
              vTextureCoord = aTextureCoord;
              vColor = aColor;
              vFragPosition = position.xyz;
          }`;
          
          // Fragment Shader pour les liquides
const liquidFragmentShader = `#version 300 es
          precision mediump float;
          
          in vec2 vTextureCoord;
          in vec3 vColor;
          in vec3 vFragPosition;
          
          uniform vec3 uPlayerPosition;
          uniform float uLightRadius;
          uniform float uTime;
          
          out vec4 fragColor;
          
          void main(void) {
              // Calcul de la distance pour l'atténuation de la lumière
              float distance = length(vFragPosition - uPlayerPosition);
              float attenuation = clamp(1.0 - (distance / uLightRadius), 0.2, 1.0);
          
              // Effet de mouvement du liquide
              vec2 distortedUV = vTextureCoord + vec2(
                  sin(uTime + vTextureCoord.x * 10.0) * 0.01,
                  cos(uTime + vTextureCoord.y * 10.0) * 0.01
              );
          
              // Effet de brillance sur la surface
              float shine = pow(max(0.0, dot(
                  normalize(vec3(0.0, 0.0, 1.0)),
                  normalize(uPlayerPosition - vFragPosition)
              )), 32.0) * 0.3;
          
              vec3 finalColor = vColor * attenuation + vec3(shine);
              fragColor = vec4(finalColor, 0.8); // Alpha de 0.8 pour la transparence
          }`;

export class GLConfiguration {
  constructor(gl) {
    this.gl = gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const spriteShaderProgram = this.initShaderProgram(gl, spriteVertexShader, spriteFragmentShader);
    this.spriteProgramInfo = {
      program: spriteShaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(spriteShaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(spriteShaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(spriteShaderProgram, 'uProjectionMatrix'),
        viewMatrix: gl.getUniformLocation(spriteShaderProgram, 'uViewMatrix'),
        uSpritePosition: gl.getUniformLocation(spriteShaderProgram, 'uSpritePosition'),
        uCameraRight: gl.getUniformLocation(spriteShaderProgram, 'uCameraRight'),
        uCameraUp: gl.getUniformLocation(spriteShaderProgram, 'uCameraUp'),
        uSpriteSampler: gl.getUniformLocation(spriteShaderProgram, 'uSpriteSampler'),
        uSpriteWidth: gl.getUniformLocation(spriteShaderProgram, 'uSpriteWidth'),
        uSpriteHeight: gl.getUniformLocation(spriteShaderProgram, 'uSpriteHeight'),
        uIsSelected: gl.getUniformLocation(spriteShaderProgram, 'uIsSelected'), // Nouvelle location
      },
    };

    const shaderProgram = this.initShaderProgram(gl, blockVertexShader, blockFragmentShader);
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        textureIndex: gl.getAttribLocation(shaderProgram, 'aTextureIndex'),
        tintColor: gl.getAttribLocation(shaderProgram, 'aTintColor'), // Nouvelle location
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        playerPosition: gl.getUniformLocation(shaderProgram, 'uPlayerPosition'),
        lightRadius: gl.getUniformLocation(shaderProgram, 'uLightRadius'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      },
    };

    const liquidShaderProgram = this.initShaderProgram(gl, liquidVertexShader, liquidFragmentShader);
    this.liquidProgramInfo = {
      program: liquidShaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(liquidShaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(liquidShaderProgram, 'aTextureCoord'),
        color: gl.getAttribLocation(liquidShaderProgram, 'aColor'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(liquidShaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(liquidShaderProgram, 'uModelViewMatrix'),
        playerPosition: gl.getUniformLocation(liquidShaderProgram, 'uPlayerPosition'),
        lightRadius: gl.getUniformLocation(liquidShaderProgram, 'uLightRadius'),
        time: gl.getUniformLocation(liquidShaderProgram, 'uTime'),
      },
    };
  }

  _loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Erreur de compilation du shader :', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = this._loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this._loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

}