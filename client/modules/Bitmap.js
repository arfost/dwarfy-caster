export class Bitmap {
  constructor(src, width, height) {
    this.image = new Image();
    this.image.src = src;
    this.loaded = false;

    this.width = width;
    this.height = height;

    this.imageLoaded = new Promise((resolve, reject) => {
      this.image.onload = () => {
        console.log("image loaded");
        resolve();
      };
    });
  }
}