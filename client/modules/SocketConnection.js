export class SocketConnection {
  constructor() {
    this.ready = new Promise((resolve) => {
      this._resolve = resolve;
    });
    const wsAdress = "ws://" + window.location.host
    console.log("connecting", wsAdress);
    this._socket = new WebSocket(wsAdress);
    this._socket.onmessage = (e)=>{
      const data = JSON.parse(e.data);
      console.log("first message", data);
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
      case "RTLayers":
        this.onRTLayers(message.datas);
        break;
    }
  }

  _send(data){
    this._socket.send(JSON.stringify(data));
  }

  sendPosition(x, y, z, dirX, dirY, orders){
    this._send({type: "position", x, y, z, dirX, dirY, orders : orders || []});
  }

  sendStop(){
    this._send({type: "stop"});
  }
}