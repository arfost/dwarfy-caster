class ObjectPool{
  constructor(generator, baseSize, chunkSize){
    this.generator = generator;
    this.baseSize = baseSize;
    this.chunkSize = chunkSize;
    this.elements = new Array(baseSize).fill(0).map(() => this.generator());
    this.elements.forEach((el) => {
      el.release = this._release.bind(this);
    });
    this.total = baseSize;
    this.out = 0;
    this.in = baseSize;
  }

  get currentSize(){
    return this.total;
  }

  _release(obj){
    this.elements.push(obj);
    this.in++;
    this.out--;
  }

  getNew(){
    if(this.elements.length === 0){
      console.log("object pool extended to ", this.total + this.chunkSize, this.total, this.in, this.out);
      const newElements = new Array(this.chunkSize).fill(0).map(() => this.generator());
      newElements.forEach((el) => {
        el.release = this._release.bind(this);
      });
      this.elements = this.elements.concat(newElements);
      this.total += this.chunkSize;
      this.in += this.chunkSize;
    }
    this.out++;
    this.in--;
    return this.elements.pop();
  }
}

class ObjectVector{
  constructor(generator, baseSize, chunkSize){
    this.generator = generator;
    this.baseSize = baseSize;
    this.chunkSize = chunkSize;
    this.elements = new Array(baseSize).fill(0).map(() => this.generator());
    this.currentIndex = 0;
  }

  read(index){
    return this.elements[index];
  }

  getCurrent(){
    if(this.currentIndex >= this.elements.length){
      this.elements = this.elements.concat(new Array(this.chunkSize).fill(0).map(() => this.generator()));
      console.log("object vector extended to ", this.elements.length, this.elements[0]);
    }
    return this.elements[this.currentIndex++];
  }

  has(index){
    return this.currentIndex > index;
  }

  get length(){
    return this.currentIndex;
  }

  reset(){
    this.currentIndex = 0;
  }
}

module.exports =  {
  ObjectPool,
  ObjectVector
};