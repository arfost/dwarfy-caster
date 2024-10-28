const simpleConsole = require('./SimpleConsole.js');
const readline = require('readline');
const minSize = {
  height: 15,
  width: 70
}

const componentInstance = {
  Title: require('./components/Title.js'),
  Menu: require('./components/Menu.js'),
  MultiLine: require('./components/MultiLine.js')
}

class Renderer {
  constructor() {
    this.errorMode = 0;
    this.currentComps = [];
    this.existingInstances = {};
    this.componentsByName = {}

    try {
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
      process.on('exit', async () => {
        this._showCursor();
        //clear the screen
        process.stdout.write("\u001b[2J\u001b[0;0H");
        await simpleConsole.processQueue();
        process.stdin.setRawMode(false);
      });
      //intercept the ctrl+c
      process.stdin.on('keypress', (str, key) => {
        if (key.ctrl && key.name === 'c') {
          process.exit();
        }
        console.log("key press: ", str, key);
        this.lastInput = key;
      });

      process.stdout.on('resize', this._isResized.bind(this));

      this._isResized();
      //clear the screen
      process.stdout.write("\u001b[2J\u001b[0;0H");

    } catch (e) {
      console.log("init fail : ", e);
      this.errorMode = 1;
    }
  }

  _isResized() {
    this.size = {
      width: process.stdout.columns,
      height: process.stdout.rows
    };
    console.log(this.size);
    if (this.size.width < minSize.width || this.size.height < minSize.height) {
      this.errorMode = 2;
    } else {
      this.errorMode = 0;
    }
    for (let component of this.currentComps) {
      component.resize(this.size);
    }
  }

  getLastInput() {
    const lastInput = this.lastInput;
    this.lastInput = undefined;
    return lastInput;
  }

  _hideCursor() {
    process.stdout.write("\u001b[?25l");
  }

  _showCursor() {
    process.stdout.write("\u001b[?25h");
  }


  drawScreen(datas) {
    if (this.errorMode) {
      this._drawError();
    }
    
    for(let comp in datas){
      this.componentsByName[comp].update(datas[comp]);
    }

    if(this._fullRedraw){
      process.stdout.write("\u001b[2J\u001b[0;0H");
    }
    for(let component of this.currentComps){
      component.draw(this._fullRedraw);
    }


    this._fullRedraw = false;

    // Hide the cursor
    this._hideCursor();

  }

  prepareScreen(componentsType, componentsOptions) {
    let components = [];
    for (let [index, componentType] of componentsType.entries()) {
      let instance;
      if(!this.existingInstances[componentType]){
        instance = componentInstance[componentType];
        if (!instance) {
          instance = componentInstance[componentType];
        }
        if (!instance) {
          throw new Error(`Component ${componentType} not found`);
        } else {
          this.existingInstances[componentType] = instance;
        }
      }else{
        instance = this.existingInstances[componentType];
      }
      const component = new instance();
      const options = componentsOptions[index];
      if(!options.name){
        throw new Error("name is required in options");
      }
      component.init(options, this.size);
      this.componentsByName[options.name] = component;
      component.on("forceRedraw", ()=>{
        this._fullRedraw = true;
      })
      components.push(component);
      
    }
    this.currentComps = components;
    this._fullRedraw = true;
  }

  get _errorCodeMessages() {
    return [
      "no error",
      "unable to start in and out correctly, maybe raw mode is insupported, or we are not a TTY",
      "screen is to small to display game interface"
    ]
  }

  _drawError() {
    process.stdout.write("\u001b[2J\u001b[0;0H");
    process.stdout.write(this._errorCodeMessages[this.errorMode]);
  }
}

module.exports = { Renderer };