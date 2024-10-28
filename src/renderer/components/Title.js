const Component = require("./Component.js");

class Title extends Component {
  
  lineToDraw() {

    this.clear();
    this.pushLine(this.datas);
  }
}

module.exports = Title;