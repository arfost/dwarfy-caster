export class Bitmap {
  constructor(src, width, height) {
    this.image = new Image();
    this.image.src = src;
    this.loaded = false;

    this.width = width;
    this.height = height;

    // this.imageLoaded = new Promise((resolve, reject) => {
    //   this.image.onload = () => {
    //     console.log("image loaded");
        

        

    //     var bandes = [];
    //     for (let x = 0; x < this.width; x++) {
    //       var tempCanvas = document.createElement('canvas');
    //       var tempCtx = tempCanvas.getContext('2d');
    //       tempCanvas.width = this.width;
    //       tempCanvas.height = this.height;
    //       tempCtx.drawImage(this.image, 0, 0);
    //       // Extraire une bande verticale de 1 pixel de large
    //       var bandeLight = tempCtx.getImageData(x, 0, 2, this.height);
    //       var bandeDark = tempCtx.getImageData(x, 0, 2, this.height);

    //       const darkAmount = -50;

    //       for (var i = 0; i < bandeDark.data.length; i += 4) {
    //         bandeDark.data[i] = Math.max(0, Math.min(255, bandeDark.data[i] + darkAmount)); // R
    //         bandeDark.data[i + 1] = Math.max(0, Math.min(255, bandeDark.data[i + 1] + darkAmount)); // G
    //         bandeDark.data[i + 2] = Math.max(0, Math.min(255, bandeDark.data[i + 2] + darkAmount)); // B
    //         // Alpha (data[i + 3]) reste inchangé
    //       }
    //       const canvasLight = document.createElement('canvas');
    //       const ctxLight = canvasLight.getContext('2d');
    //       canvasLight.width = 2;
    //       canvasLight.height = this.height;
    //       ctxLight.putImageData(bandeLight, 0, 0);

    //       const canvasDark = document.createElement('canvas');
    //       const ctxDark = canvasDark.getContext('2d');
    //       canvasDark.width = 2;
    //       canvasDark.height = this.height;
    //       ctxDark.putImageData(bandeDark, 0, 0);

    //       bandes.push([canvasLight, canvasDark]);
    //     }
    //     this.loaded = true;
    //     this.bandes = bandes;
    //     resolve();
    //   };
    // });
  }
}