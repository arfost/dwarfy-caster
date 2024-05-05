export class ObjectPool{
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