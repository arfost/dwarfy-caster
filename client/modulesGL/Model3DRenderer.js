import { FurnitureGeometryFactory } from "./FurnitureGeometryFactory.js";

export class Model3DRenderer {
  constructor(gl) {
      this.gl = gl;
      this.initShaderProgram();
      this.models = new Map();
  }

  initShaderProgram() {
      const vertexShader = `#version 300 es
          in vec4 aVertexPosition;
          in vec2 aTextureCoord;

          uniform mat4 uModelMatrix;
          uniform mat4 uViewMatrix;
          uniform mat4 uProjectionMatrix;
          uniform vec3 uTintColor;
          uniform float uIsSelected;

          out vec2 vTextureCoord;
          out vec3 vTintColor;
          out float vIsSelected;

          void main(void) {
              gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
              vTextureCoord = aTextureCoord;
              vTintColor = uTintColor;
              vIsSelected = uIsSelected;
          }
      `;

      const fragmentShader = `#version 300 es
          precision highp float;

          in vec2 vTextureCoord;
          in vec3 vTintColor;
          in float vIsSelected;

          uniform sampler2D uSampler;

          out vec4 fragColor;

          void main(void) {
              vec4 texelColor = texture(uSampler, vTextureCoord);
              vec3 finalColor = texelColor.rgb * vTintColor;
              
              if (vIsSelected > 0.5) {
                  finalColor = mix(finalColor, vec3(1.0), 0.3);
              }
              
              fragColor = vec4(finalColor, texelColor.a);
              if (fragColor.a < 0.1) discard;
          }
      `;

      const program = this.gl.createProgram();
      
      // Compilation des shaders
      const vShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.gl.shaderSource(vShader, vertexShader);
      this.gl.compileShader(vShader);

      const fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.gl.shaderSource(fShader, fragmentShader);
      this.gl.compileShader(fShader);

      // Liaison des shaders au programme
      this.gl.attachShader(program, vShader);
      this.gl.attachShader(program, fShader);
      this.gl.linkProgram(program);

      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
          console.error('Erreur d\'initialisation du programme shader');
          return null;
      }

      this.programInfo = {
          program: program,
          attribLocations: {
              vertexPosition: this.gl.getAttribLocation(program, 'aVertexPosition'),
              textureCoord: this.gl.getAttribLocation(program, 'aTextureCoord')
          },
          uniformLocations: {
              projectionMatrix: this.gl.getUniformLocation(program, 'uProjectionMatrix'),
              viewMatrix: this.gl.getUniformLocation(program, 'uViewMatrix'),
              modelMatrix: this.gl.getUniformLocation(program, 'uModelMatrix'),
              uSampler: this.gl.getUniformLocation(program, 'uSampler'),
              tintColor: this.gl.getUniformLocation(program, 'uTintColor'),
              isSelected: this.gl.getUniformLocation(program, 'uIsSelected')
          }
      };
  }

  createModel(modelType) {
      let geometry = {
          positions: [],
          textureCoordinates: [],
          indices: [],
          vertexCount: 0
      };

      FurnitureGeometryFactory.getGeometry(modelType, geometry, 0, 0, 0);
      
      const buffers = {
          position: this.createBuffer(geometry.positions),
          textureCoord: this.createBuffer(geometry.textureCoordinates),
          indices: this.createIndexBuffer(geometry.indices),
          count: geometry.indices.length
      };

      this.models.set(modelType, buffers);
      return buffers;
  }

  createBuffer(data) {
      const buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
      return buffer;
  }

  createIndexBuffer(data) {
      const buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.gl.STATIC_DRAW);
      return buffer;
  }

  render(modelType, position, rotation, scale, texture, tintColor, isSelected, viewMatrix, projectionMatrix) {
      const gl = this.gl;
      
      // Sauvegarde de l'état actuel

      // Activation de notre programme
      gl.useProgram(this.programInfo.program);

      let buffers = this.models.get(modelType);
      if (!buffers) {
          buffers = this.createModel(modelType);
      }

      // Configuration des matrices
      const modelMatrix = mat4.create();
      mat4.translate(modelMatrix, modelMatrix, position);
      mat4.rotateZ(modelMatrix, modelMatrix, rotation);
      mat4.scale(modelMatrix, modelMatrix, scale);

      // Configuration des uniforms
      gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(this.programInfo.uniformLocations.viewMatrix, false, viewMatrix);
      gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelMatrix, false, modelMatrix);
      gl.uniform3fv(this.programInfo.uniformLocations.tintColor, tintColor);
      gl.uniform1f(this.programInfo.uniformLocations.isSelected, isSelected ? 1.0 : 0.0);

      // Configuration de la texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);

      // Configuration des attributs
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
      gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
      gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
      gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);

      // Rendu
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
      gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0);

  }
}