const TerminalHelper = require("../TerminalHelper.js");

class Component {

  constructor() {
    this.events = {};
  }

  init(options, rendererSize) {
    this.rendererSize = rendererSize;
    this.options = options;
    this.border = options.border || false;
    this.borderSymbol = options.borderSymbol || "*";
    this.colors = TerminalHelper.colorToAnsi(options.fColor || "white", options.bColor || "black");
    this.resize(rendererSize);
    this.lineList = [];
    this.specialLines = [];
  }

  resetDrawInfos() {
    this.lineList = [];
    this.specialLines = [];
  }

  pushLine(text, center, colors) {
    this.lineList.push({ text, colors, center });
  }

  pushSpecialLine(x, y, char, colors) {

    this.specialLines.push({ x, y, char, colors });
  }

  resize(rendererSize) {
    this.rendererSize = rendererSize;
    this.size = {
      width: Math.floor(rendererSize.width * (this.options.size.width / 100)),
      height: Math.floor(rendererSize.height * (this.options.size.height / 100))
    }
    this.pos = {
      x: Math.floor(rendererSize.width * (this.options.pos.x / 100)),
      y: Math.floor(rendererSize.height * (this.options.pos.y / 100))
    }
    this.dirty = true;
  }

  update(newDatas) {
    const hashedDatas = JSON.stringify(newDatas);
    if (this._hashedDatas !== hashedDatas) {
      this._hashedDatas = hashedDatas;
      this.datas = newDatas;
      this.dirty = true;
    }
  }

  clear() {
    for (let i = 0; i < this.size.height; i++) {
      process.stdout.write(TerminalHelper.positionToAnsi(this.pos.x, this.pos.y + i));
      process.stdout.write(" ".repeat(this.size.width));
    }
  }

  lineToDraw() {
    throw new Error("Method not implemented in child class");
  }

  getColors(fg, bg) {
    if (!fg) {
      fg = this.options.fColor || "white";
    }
    if (!bg) {
      bg = this.options.bColor || "black";
    }
    return TerminalHelper.colorToAnsi(fg, bg);
  }

  draw(forceRedraw) {
    if (this.dirty || forceRedraw) {

      process.stdout.write(this.colors);
      this.resetDrawInfos();
      this.lineToDraw(this.datas);
      if(this.stopDraw){
        this.stopDraw = false;
        this.dirty = false;
        return;
      }

      for (let [index, line] of this.lineList.entries()) {
        const cursorPos = {
          x: this.pos.x + (this.border ? 1 : 0),
          y: this.pos.y + index + (this.border ? 1 : 0)
        }
        if(line.center || this.options.centered){
          cursorPos.x = cursorPos.x + Math.floor((this.size.width - line.text.length + 1)/2);
        }
        if(line.hCenter || this.options.hCentered){
          cursorPos.y = cursorPos.y + Math.floor((this.size.height - this.lineList.length + 1)/2);
        }
        process.stdout.write(
          TerminalHelper.positionToAnsi(cursorPos.x, cursorPos.y)
        );
        if (line.colors) {
          process.stdout.write(line.colors);
        }
        process.stdout.write(line.text);
        if (line.colors) {
          process.stdout.write(this.colors);
        }
      }
      for (let specialLine of this.specialLines) {
        const cursorPos = {
          x: this.pos.x + specialLine.x,
          y: this.pos.y + specialLine.y
        }
        console.log("special ! ", specialLine, cursorPos);
        process.stdout.write(
          TerminalHelper.positionToAnsi(cursorPos.x, cursorPos.y)
        );
        if (specialLine.colors) {
          process.stdout.write(specialLine.colors);
        }
        process.stdout.write(specialLine.char);
        if (specialLine.colors) {
          process.stdout.write(this.colors);
        }
      }
      if (this.border && this.lineList.length > 0) {
        process.stdout.write(
          TerminalHelper.positionToAnsi(this.pos.x, this.pos.y)
        );
        process.stdout.write(this.newDecorationLine());
        process.stdout.write(
          TerminalHelper.positionToAnsi(this.pos.x, this.pos.y + this.size.height-1)
        );
        process.stdout.write(this.newDecorationLine());
        for (let i = 1; i < this.size.height - 1; i++) {
          process.stdout.write(
            TerminalHelper.positionToAnsi(this.pos.x, this.pos.y + i)
          );
          process.stdout.write(this.borderSymbol);
          process.stdout.write(
            TerminalHelper.positionToAnsi(this.pos.x + this.size.width, this.pos.y + i)
          );
          process.stdout.write(this.borderSymbol);
        }
      }


      //this line is to avoid the cursor to be in the component
      process.stdout.write("\x1b[0m\u001b[0;0H");
      this.dirty = false;
    }
  }

  get height() {
    if (this.border) {
      return this.size.height - 2;
    }
    return this.size.height;
  }

  get width() {
    if (this.border) {
      return this.size.width - 2;
    }
    return this.size.width;
  }

  decorateLine(line, decoration) {
    if (!decoration || typeof decoration === "number") { //because map send index.
      decoration = this.borderSymbol;
    }
    line.text = " " + line.text;
    if (line.text.length < this.width) {
      line.text = line.text + " ".repeat(this.width - line.text.length + 1);
    }
    line.text = line.text.replace(/.$/, decoration).replace(/^./, decoration);
    return line
  }

  newDecorationLine(width = this.size.width, deco = this.borderSymbol) {
    return deco.repeat(width);
  }

  on(eventName, eventAction) {
    this.events[eventName] = eventAction;
  }

  emit(eventName, options) {
    this.events[eventName](options);
  }
}

module.exports = Component;