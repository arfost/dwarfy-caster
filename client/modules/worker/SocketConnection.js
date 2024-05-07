export class SocketConnection {
  constructor() {
    this.ready = new Promise((resolve) => {
      this._resolve = resolve;
    });
    this._socket = new WebSocket('ws://localhost:8080');
    this._socket.onmessage = (e)=>{
      console.log("first message", e);
      const data = JSON.parse(e.data);
      if(data.type === 'handshake'){
        this.initData = data;
        this._finishInit();
      }
    }
  }

  async _finishInit() {
    this._socket.onmessage = this._receive.bind(this);
    this._resolve();
  }

  _receive({data}){
    this._socket.send(JSON.stringify({type: "stop"}));
    const message = JSON.parse(data);
    if(message.type === "update"){
      this.onmapupdate(message);
    }
  }
}