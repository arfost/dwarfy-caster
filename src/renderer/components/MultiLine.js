const Component = require("./Component.js");

class Menu extends Component {

  lineToDraw() {
    this.clear();
    for(let i = this.datas.length-1; (this.lineList.length<this.size.height && i>=0); i--){
      const line = this.datas[i];
      if(line.length<this.size.width){
        this.pushLine(line);
      }else{
        //do multiline
        let lineToDraw = line;
        let lineToDrawLength = line.length;
        let lineLength = this.size.width;
        let lineIndex = 0;
        while(lineToDrawLength>0){
          this.pushLine(lineToDraw.slice(lineIndex, lineIndex+lineLength));
          lineToDrawLength -= lineLength;
          lineIndex += lineLength;
        }
      }
    }
  }
}

module.exports = Menu;