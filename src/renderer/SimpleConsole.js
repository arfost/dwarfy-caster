const fs = require('fs');
const path = require('path');

class SimpleConsole {
  constructor(logFilePath) {
    //empty the log file
    fs.writeFileSync(logFilePath, '');
    this.logFilePath = logFilePath;
    this.queue = [];
    this.isWriting = false;
    }

    log(...messages) {
    const logMessage = new Date().toISOString() + " - " + messages.map(msg => { 
      if(msg instanceof Error){
        return JSON.stringify({
          name: msg.name,
          message: msg.message,
          stack: msg.stack,
        })
      }else{
        return typeof msg === 'object' ? JSON.stringify(msg) : msg
      }
    }).join(' ')+"\n"
    this.queue.push(logMessage);
    this.processQueue();
    }

    async processQueue() {
    if (this.isWriting || this.queue.length === 0) {
      return;
    }

    this.isWriting = true;
    const message = this.queue.shift();

    try {
      await fs.promises.appendFile(this.logFilePath, message, 'utf8');
    } catch (error) {
      console.error('Failed to write log message:', error);
    } finally {
      this.isWriting = false;
      await this.processQueue();
    }
    }
  }

  const logFilePath = path.join(__dirname, 'log.txt');
  const simpleConsole = new SimpleConsole(logFilePath);
  console.log = simpleConsole.log.bind(simpleConsole);

  module.exports = simpleConsole;
