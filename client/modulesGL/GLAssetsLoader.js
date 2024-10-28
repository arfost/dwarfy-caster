import { Bitmap } from "../modules/Bitmap.js";

export class GLAssetsLoader {
  constructor(gl) {
    this.gl = gl;
  }

  _isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

  loadTextures(assets) {
    return new Promise((resolve) => {
      const promises = [];
      for (let assetName of assets) {
        promises.push(this.loadTexture(assetName));
      }
      Promise.all(promises).then((res) => {
        resolve(res);
      });
    });
  }

  loadTextureArray(urls) {
    return new Promise((resolve) => {
      const promises = [];
      for (let url of urls) {
        promises.push(this.loadImage(url));
      }
      Promise.all(promises).then((images) => {
        console.log(images);
        const texture = this.createTextureArray(this.gl, images);
        resolve(texture);
      });
    });
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Bitmap(url, 256, 256);
      image.imageLoaded.then(() => {
        resolve(image.image);
      });
    });
  }

  createTextureArray(gl, images) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
  
    const width = images[0].width;
    const height = images[0].height;
    const depth = images.length;
  
    // Utiliser un format explicitement non-prémultiplié
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  
    // Définir la taille du tableau de textures
    gl.texImage3D(
      gl.TEXTURE_2D_ARRAY,
      0,                   
      gl.RGBA,            // Changé de RGBA8 à RGBA pour plus de compatibilité
      width,              
      height,             
      depth,              
      0,                  
      gl.RGBA,            
      gl.UNSIGNED_BYTE,   
      null                
    );
  
    // Charger chaque image
    images.forEach((image, index) => {
      gl.texSubImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,                   
        0,                   
        0,                   
        index,               
        width,               
        height,              
        1,                   
        gl.RGBA,             
        gl.UNSIGNED_BYTE,    
        image                
      );
    });
  
    // Configurer les paramètres de la texture
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Changé en CLAMP_TO_EDGE
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Changé en CLAMP_TO_EDGE
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
  
    return texture;
  }

  loadTexture(url) {
    return new Promise((resolve, reject) => {
      const texture = this.gl.createTexture();
      const image = new Bitmap(url, 64, 64);

      image.imageLoaded.then(() => {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        
        // Configuration pour la transparence
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        this.gl.pixelStorei(this.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this.gl.NONE);
        
        this.gl.texImage2D(
          this.gl.TEXTURE_2D, 
          0, 
          this.gl.RGBA, 
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE, 
          image.image
        );

        if (this._isPowerOf2(image.width) && this._isPowerOf2(image.height)) {
          this.gl.generateMipmap(this.gl.TEXTURE_2D);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_NEAREST);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        } else {
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        }
        resolve(texture);
      });
    });
  }
}