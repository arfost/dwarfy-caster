export class Bitmap {
  constructor(src, width, height) {
    this.width = width;
    this.height = height;
    this.name = src.split('/').pop();
    this.src = src;
    this.loaded = false;
    this.blobUrl = null;

    this.image = new Image();
    this.imageLoaded = this._initializeImage();
  }

  async _initializeImage() {
    try {
      await new Promise((resolve, reject) => {
        this.image.onload = () => {
          this.loaded = true;
          resolve();
        };
        this.image.onerror = () => reject(new Error(`Failed to load image: ${this.src}`));
        this.image.src = this.src;
      });

      // Redimensionner si nécessaire
      if (this.image.width !== this.width || this.image.height !== this.height) {
        await this._resizeImage();
      }
    } catch (error) {
      console.warn(`Loading original image failed: ${this.src}`, error);
      await this._setDefaultImage();
    }

    return this;
  }

  async _resizeImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.image, 0, 0, this.width, this.height);

    await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          // Nettoyer l'ancienne URL si elle existe
          if (this.blobUrl) {
            URL.revokeObjectURL(this.blobUrl);
          }
          this.blobUrl = URL.createObjectURL(blob);
          this.image.onload = resolve;
          this.image.onerror = reject;
          this.image.src = this.blobUrl;
        } else {
          reject(new Error('Failed to create blob for resized image'));
        }
      }, 'image/png');
    });
  }

  async _setDefaultImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext('2d');
    
    // Fond gris clair
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Motif d'erreur (damier)
    ctx.fillStyle = '#999999';
    const tileSize = this.width / 8;
    for(let y = 0; y < 8; y++) {
      for(let x = 0; x < 8; x++) {
        if((x + y) % 2 === 0) {
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }

    // Texte d'erreur
    ctx.fillStyle = '#000000';
    const fontSize = this.width === 256 ? 18 : 10;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.width/2, this.height/2);
    
    this.name += '::default';

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          // Nettoyer l'ancienne URL si elle existe
          if (this.blobUrl) {
            URL.revokeObjectURL(this.blobUrl);
          }
          this.blobUrl = URL.createObjectURL(blob);
          this.image.onload = resolve;
          this.image.onerror = reject;
          this.image.src = this.blobUrl;
        } else {
          reject(new Error('Failed to create default image blob'));
        }
      }, 'image/png');
    });
  }

  dispose() {
    // Nettoyer les ressources
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
    this.image.src = '';
    this.loaded = false;
  }
}