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
    const message = JSON.parse(data);
    switch(message.type){
      case "mapChunk":
        this.onChunk(message.datas);
        break;
      case "placeables":
        this.onPlaceables(message.datas);
        break;
      case "RTUpdate":
        this.onRTUpdate(message.datas);
        break;
    }
  }

  _send(data){
    this._socket.send(JSON.stringify(data));
  }

  sendPosition(x, y, z){
    this._send({type: "position", x, y, z});
  }

  sendStop(){
    this._send({type: "stop"});
  }
}