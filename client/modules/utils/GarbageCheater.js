export class GarbageCheater{
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
      console.log("garbage cheater extended to ", this.elements.length, this.elements[0]);
    }
    return this.elements[this.currentIndex++];
  }

  has(index){
    return this.currentIndex >= index;
  }

  get length(){
    return this.currentIndex;
  }

  reset(){
    this.currentIndex = 0;
  }
}