const readline = require('readline');

const minSize = {
  "rows": 15,
  "columns": 70
}


class CommandLineProcessor {
  constructor(commands, title = "debug console") {
    console.log = this._consoleLog.bind(this);
    this.title = title;
    this.commandLineArgs = process.argv.slice(2);

    this.textList = ["welcome to the debug console", "press echap to exit"];

    this.errorMode = 0;
    try {
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
      process.on('exit', () => {
        process.stdin.setRawMode(false);
      });

      process.stdout.write("\u001b[2J\u001b[0;0H");
      process.stdout.write("\u001b[=2h");
    } catch (e) {
      this.errorMode = 1;
    }

    process.stdout.on('resize', this.isResized.bind(this));

    this.lastInput = false;
    process.stdin.on('keypress', this.keyPressed.bind(this));
    
    this.isResized();
    this.cursorPosition = 0;
    
    this.shouldRedraw = true;

    this.currentCommand = "";
    this.commands = {
      ...commands,
      list: {
        description: "list all commands",
        args: [],
        callback: (args) => {
          return Object.keys(commands).map((key) => {
            return `${key} : ${commands[key].description}`;
          });
        }
      }
    };
  }

  keyPressed(str, details) {

    if (details.name === "escape") {
      process.exit(0);
    }

    //move cursor with up/down keys
    if (details.name === "up") {
      this.cursorPosition = Math.min(this.textList.length - (this.size.rows - 3), this.cursorPosition + 1);
      this.shouldRedraw = true;
      return;
    }

    if (details.name === "down") {
      this.cursorPosition = Math.max(0, this.cursorPosition - 1);
      this.shouldRedraw = true;
      return;
    }

    //execute command with return key
    if(details.name === "return") {
      this.executeCommand();
      this.shouldRedraw = true;
      return;
    }
    
    //handle backspace
    if(details.name === "backspace") {
      this.currentCommand = this.currentCommand.slice(0, -1);
      this.shouldRedraw = true;
      return;
    }

    //tab completion
    if(details.name === "tab") {
      //find all possible commands
      const possibleCommands = Object.keys(this.commands).filter((key) => {
        return key.startsWith(this.currentCommand);
      });
      //if only one command, complete it or complete the common part
      if(possibleCommands.length === 1) {
        this.currentCommand = possibleCommands[0];
      }else{
        //find common part of all possible commands
        const commonPart = possibleCommands.reduce((acc, key) => {
          let i = 0;
          while(acc[i] === key[i] && i < acc.length) {
            i++;
          }
          return acc.slice(0, i);
        }, possibleCommands[0]);

        this.currentCommand = commonPart;
      }
      this.shouldRedraw = true;
      return;
    }

    this.currentCommand += str;
    this.shouldRedraw = true;
  }

  executeCommand() {
    const command = this.currentCommand.split(" ");
    const commandName = command[0];
    this.textList.push("execute command : "+commandName);
    const args = command.slice(1);
    if(this.commands[commandName]) {
      const argsObj = {};
      this.commands[commandName].args.forEach((arg, index) => {
        argsObj[arg] = args[index];
      });
      const result = this.commands[commandName].callback(argsObj);
      //consume result if array or string or wait if promise
      if(result instanceof Promise) {
        result.then(this._directConsumeCommandResult.bind(this));
      }else{
        this._directConsumeCommandResult(result);
      }
    } else {
      this.textList.push("command not found : "+commandName);
    }
    this.currentCommand = "";
  }

  _consoleLog(...args) {
    this.textList.push(args.map(arg=>JSON.stringify(arg)).join(" "));
    this.shouldRedraw = true;
  }

  _directConsumeCommandResult(result) {
    if(result instanceof Array) {
      for(let line of result) {
        //clean line of return caracters
        line = line.replace(/[\n\r]/g, "");
        this.textList.push(line);
      }
      this.shouldRedraw = true;
      return;
    }
    if(result instanceof String) {
      //clean line of return caracters
      result = result.replace(/[\n\r]/g, "");
      this.textList.push(result);
      this.shouldRedraw = true;
      return;
    }
    this.textList.push("invalid command result");
    this.shouldRedraw = true;
  }

  drawScreen() {
    if (!this.shouldRedraw) {
      return;
    }

    if (this.errorMode !== 0) {
      this.drawError();
      this.shouldRedraw = false;
      return;
    }

    //clear screen
    process.stdout.write("\u001b[2J\u001b[0;0H");

    //draw title centered on top
    process.stdout.write(CommandLineProcessor.positionToAnsi(0, Math.floor(this.size.columns / 2 - this.title.length / 2)));
    process.stdout.write(this.title);

    //draw cursor value and position
    process.stdout.write(CommandLineProcessor.positionToAnsi(0, 0));
    process.stdout.write(`cursorPosition : ${this.cursorPosition+1}/${this.textList.length - (this.size.rows - 3)}`);

    //draw separator
    process.stdout.write(CommandLineProcessor.positionToAnsi(1, 0));
    process.stdout.write("=".repeat(this.size.columns));

    //draw text lines from textList starting by last offset by cursorPosition up to the screen size
    const countLinesToDisplay = this.size.rows - 3;
    for (let i = 0; i < countLinesToDisplay; i++) {
      const line = this.textList[this.textList.length - i - this.cursorPosition - 1];
      if (line) {
        process.stdout.write(CommandLineProcessor.positionToAnsi(this.size.rows - 2 - i, 5));
        process.stdout.write(line);
      }
    }
    

    //test if current command as a space
    const isSpace = this.currentCommand.includes(" ");
    if(isSpace) {
      //if command exist
      const command = this.currentCommand.split(" ");
      const commandName = command[0];
      if(this.commands[commandName]) {
        //draw possible args for current command at the bottom right side of the screen
        const args = "(" + this.commands[commandName].args.join("|") + ")";
        process.stdout.write(CommandLineProcessor.positionToAnsi(this.size.rows - 1, this.size.columns - args.length - 5));
        process.stdout.write(args);
      }else{
        //draw error message at the bottom right side of the screen
        const error = "command not found : "+commandName;
        process.stdout.write(CommandLineProcessor.positionToAnsi(this.size.rows - 1, this.size.columns - error.length - 5));
        process.stdout.write(error);
      }
    }else{
      //draw all possibles commands from current command list at the bottom right side of the screen
      const possibleCommands = "(" + Object.keys(this.commands).filter((key) => {
        return key.startsWith(this.currentCommand);
      }).map(key=>{
        return key + (this.commands[key].args.length > 0 ? "*" : "");
      }).join("|") + ")";
      process.stdout.write(CommandLineProcessor.positionToAnsi(this.size.rows - 1, this.size.columns - possibleCommands.length - 5));
      process.stdout.write(possibleCommands);
    }

    //draw current command
    process.stdout.write(CommandLineProcessor.positionToAnsi(this.size.rows - 1, 0));
    process.stdout.write("com : " + this.currentCommand);

    this.shouldRedraw = false;
  }

  get errorCodeMessages() {
    return [
      "no error",
      "unable to start in and out correctly, maybe raw mode is insupported, or we are not a TTY",
      "screen is to small to display game interface"
    ]
  }

  drawError() {
    process.stdout.write("\u001b[2J\u001b[0;0H");
    process.stdout.write(this.errorCodeMessages[this.errorMode]);
  }

  isResized() {
    this.size = {
      columns: process.stdout.columns,
      rows: process.stdout.rows
    };
    console.log(this.size);
    if (this.size.columns < minSize.columns || this.size.rows < minSize.rows) {
      this.errorMode = 2;
      this.shouldRedraw = true;
    } else {
      process.stdout.write("\u001b[2J\u001b[0;0H");
      this.errorMode = 0;
      this.shouldRedraw = true;
    }
  }

  getCommandLineArgs() {
    return this.commandLineArgs;
  }

  static positionToAnsi(y, x) {
    return "\x1B[" + (y + 1) + ";" + (x + 1) + "H";
  }

  stop() {
    this.stopped = true;
  }

  run() {
    this.stopped = false;
    this.drawScreen();
    if(this.stopped) {
      return;
    }
    setTimeout(this.run.bind(this), 100);
  }

}

module.exports = {CommandLineProcessor};