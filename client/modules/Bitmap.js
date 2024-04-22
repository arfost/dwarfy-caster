export class Bitmap {
  constructor(src, width, height) {
    this.image = new Image();
    this.image.src = src;
    this.loaded = false;

    this.src = src;
    this.name = src.split('/').pop();

    this.width = width;
    this.height = height;

    this._available = false;

    this.imageLoaded = new Promise((resolve, reject) => {
      this._available = resolve;
      this._unavailable = reject;
    });

    this.image.onload = () => {
      console.log("image loaded");
      this._available();
    };

    this.image.onerror = () => {
      console.log("image load failed, setting default image");
      this.setDefaultImage().then(this._available).catch(this._unavailable);
    };
  }

  async setDefaultImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext('2d');
    // Dessinez votre image par défaut ici
    // Par exemple, remplir le canvas avec une couleur de fond
    ctx.fillStyle = '#cccccc'; // Couleur de fond
    ctx.fillRect(0, 0, this.width, this.height);
    // Ajoutez du texte ou d'autres éléments si nécessaire

    
    ctx.fillStyle = '#000'; // Couleur du texte
    ctx.font = '12px Arial';
    ctx.fillText(this.name, 10, 50);

    ctx.fillText("load error", 20, 90);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          this.image.src = URL.createObjectURL(blob);
          this.loaded = true;
          resolve();
        } else {
          reject('Failed to create default image');
        }
      });
    });
  }
}