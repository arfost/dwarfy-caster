export class Bitmap {
  constructor(src, width, height) {
    this.image = new Image();
    this.src = src;
    this.name = src.split('/').pop();
    this.width = width;
    this.height = height;
    this.loaded = false;
    this.imageData = null;

    this.imageLoaded = new Promise((resolve, reject) => {
      this.image.onload = () => {
        this.loaded = true;
        this.createImageData();
        resolve();
      };

      this.image.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        this.setDefaultImage()
          .then(() => {
            this.createImageData();
            resolve();
          })
          .catch(reject);
      };

      this.image.src = src;
    });
  }

  getImageData() {
    if (!this.imageData) {
      console.warn(`ImageData not available for ${this.name}`);
      return new Uint8ClampedArray(this.width * this.height * 4);
    }
    return this.imageData.data;
  }

  createImageData() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.image, 0, 0, this.width, this.height);

    this.imageData = ctx.getImageData(0, 0, this.width, this.height);
  }

  async setDefaultImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#000';
    ctx.font = this.width === 256 ? '18px Arial' : '8px Arial';
    ctx.fillText(this.name, 10, 45);
    ctx.fillText("load error", 20, 20);

    this.name += '::default';

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          this.image.src = url;
          this.image.onload = () => {
            URL.revokeObjectURL(url);
            this.loaded = true;
            resolve();
          };
        } else {
          reject('Failed to create default image');
        }
      });
    });
  }
}