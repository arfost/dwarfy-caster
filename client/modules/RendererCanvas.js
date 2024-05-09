import { Bitmap } from "./Bitmap.js";

export class RendererCanvas {
  constructor(display, { resolution, width, height }) {

    this.display = display;
    this.ctx = display.getContext('2d', { alpha: false });

    // this.width = display.width = Math.floor(window.innerWidth*0.5);
    // this.height = display.height = Math.floor(window.innerHeight*0.5);

    this.width = display.width = width;
    this.height = display.height = height;

    this.resolution = resolution;
    this.spacing = this.width / resolution;

    this.renderInstruction = [];

    this.call = 0;
    this.currentTime = 0;
  };

  updateRenderInstruction(instruction) {
    this.renderInstruction = instruction;
    // if (this.renderInstruction.length === 0) {
    //   this.renderInstruction = instruction;
    // }
  }

  async initTextures(definitions) {
    const assetNames = definitions.assetNames;
    this.textures = {};

    await Promise.all(assetNames.textures.map(async (textureName) => {
      let texture = new Bitmap(`assets/textures/${textureName}.png`, 256, 256);
      this.textures[textureName] = texture;
      return texture.imageLoaded;
    }));

    this.sprites = {};

    await Promise.all(assetNames.sprites.map(async (def) => {
      let sprite = new Bitmap(`assets/sprites/${def.name}.png`, 64, 64 * def.heightRatio);
      this.sprites[def.name] = sprite;
      return sprite.imageLoaded;
    }));

    this.preparedTints = definitions.tintDefinitions.map((tint) => {
      return tint === false ? false : `rgba(${tint.red}, ${tint.green}, ${tint.blue}, 0.3)`;
    });
  }


  render(seconds) {
    // this.currentTime += seconds;
    // if (this.currentTime > 0.05 && this.call < this.renderInstruction.length - 1) {
    //   //console.log("rendering", this.call, this.renderInstruction.length, this.renderInstruction[this.call])
    //   const instruction = this.renderInstruction[this.call];
    //   if (instruction.length === 5) {
    //     this._drawColoredColumn(instruction[0], instruction[1], instruction[2], instruction[3], instruction[4]);
    //   } else {
    //     this._drawTexturedColumn(this.textures[instruction[0]], instruction[1], instruction[2], instruction[3], instruction[4], instruction[5], instruction[6], instruction[7]);
    //   }
    //   this.currentTime = 0;
    //   this.call++;
    // }
    //this.drawCallList = [];
    //this.droppedCallList = [];
    this.ctx.clearRect(0, 0, this.width, this.height);
    // console.log("render instruction", this.renderInstruction.length);

    for (let instruction of this.renderInstruction) {
      //console.log("instruction", instruction);
      switch(instruction.length){
        case 5:
          this._drawColoredColumn(instruction[0], instruction[1], instruction[2], instruction[3], instruction[4]);
          break;
        case 7:
          this._drawTexturedColumn(this.textures[instruction[0]], instruction[1], instruction[2], instruction[3], instruction[4], instruction[5], this.preparedTints[instruction[6]]);
          break;
        case 8:
          this._drawSpriteColumn(this.sprites[instruction[0]], instruction[1], instruction[2], instruction[3], instruction[4], instruction[5], instruction[6], /*instruction[7] ignored, here only for size diff*/);
          break;
      }
    }

    //console.log("render instruction", this.renderInstruction.length);

    //console.log("drawCallList", this.drawCallList);
  }

  _drawSpriteColumn(sprite, drawXStart, drawXEnd, clipStartX, drawStartY, drawWidth, spriteHeight) {
    this.ctx.drawImage(sprite.image, drawXStart, 0, drawXEnd, sprite.height, clipStartX, drawStartY, drawWidth, spriteHeight);
  }

  _drawTexturedColumn(image, texX, x, top, height, shade, tint) {

    this.ctx.drawImage(image.image, texX, 0, 1, image.height, x, top, this.spacing, height);

    //tinting
    if (tint) {
      this.ctx.fillStyle = tint;
      this.ctx.fillRect(x, top, this.spacing, height);
    }

    //shading
    this.ctx.fillStyle = `rgba(0,0,0,${shade})`;
    this.ctx.fillRect(x, top, this.spacing, height);

  }

  _drawColoredColumn(x, top, height, shade, tint) {
    this.ctx.fillStyle = tint;
    this.ctx.fillRect(x, top, this.spacing, height);

    this.ctx.fillStyle = `rgba(0,0,0,${shade})`;
    this.ctx.fillRect(x * this.spacing, top, this.spacing, height);
  }
}