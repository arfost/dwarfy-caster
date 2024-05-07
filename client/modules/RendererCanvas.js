import { Bitmap } from "./Bitmap.js";

export class RendererCanvas {
  constructor(display, resolution) {

    this.display = display;
    this.ctx = display.getContext('2d');

    // this.width = display.width = Math.floor(window.innerWidth*0.5);
    // this.height = display.height = Math.floor(window.innerHeight*0.5);

    this.width = display.width = 640;
    this.height = display.height = 360;

    this.resolution = resolution;
    this.spacing = this.width / resolution;

    this.renderInstruction = [];

  };

  updateRenderInstruction(instruction) {
    this.renderInstruction = instruction;
  }

  async initTextures(assetNames) {

    this.textures = {};

    await Promise.all(assetNames.textures.map(async (textureName) => {
      let texture = new Bitmap(`assets/textures/${textureName}.png`, 256, 256);
      this.textures[textureName] = texture;
      return texture.imageLoaded;
    }));

    this.sprites = {};

    await Promise.all(assetNames.sprites.map(async (def) => {
      let sprite = new Bitmap(`assets/sprites/${def.name}.png`, 64, 64*def.heightRatio);
      this.sprites[def.name] = sprite;
      return sprite.imageLoaded;
    }));
  }

  render() {
    //this.drawCallList = [];
    //this.droppedCallList = [];
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (let instruction of this.renderInstruction) {
      //console.log("instruction", instruction);
      if(instruction.length === 5) {
        this._drawColoredColumn(instruction[0], instruction[1], instruction[2], instruction[3], instruction[4]);
      }else{
        this._drawTexturedColumn(this.textures[instruction[0]], instruction[1], instruction[2], instruction[3], instruction[4], instruction[5], instruction[6], instruction[7]);
      }
    }

    //console.log("render instruction", this.renderInstruction.length);

    //console.log("drawCallList", this.drawCallList);
  }



  _drawTexturedColumn(image, texX, x, top, height, shade, tint) {

    this.ctx.drawImage(image.image, texX, 0, 1, image.height, x, top, this.spacing, height);

    //tinting
    if (tint) {
      this.ctx.fillStyle = `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, 0.3)`;
      this.ctx.fillRect(x, top, this.spacing, height);
    }
    
    //shading
    this.ctx.fillStyle = `rgba(0,0,0,${shade})`;
    this.ctx.fillRect(x, top, this.spacing, height);

  }

  _drawColoredColumn(x, top, height, shade, tint) {
    this.ctx.fillStyle = `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, 0.5)`;
    this.ctx.fillRect(x, top, this.spacing, height);

    this.ctx.fillStyle = `rgba(0,0,0,${shade})`;
    this.ctx.fillRect(x * this.spacing, top, this.spacing, height);
  }
}