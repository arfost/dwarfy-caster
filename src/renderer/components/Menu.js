const Component = require("./Component.js");

class Menu extends Component {

  lineToDraw() {
    this.clear();
    for(let [index, item] of this.datas.items.entries()){
      if(index === this.datas.selected){
        this.pushLine(`$ ${item} $`);
      }else{
        this.pushLine(`  ${item}  `);
      }
    }
  }
}

module.exports = Menu;