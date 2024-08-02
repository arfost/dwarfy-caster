const { generateRandomId } = require('../utils/helpers.js');

class Player {
  constructor(ws, start) {
    this.socket = ws;

    this.id = generateRandomId();

    this.socket.on('message', this._receiveData.bind(this));
    this.socket.on('close', this._close.bind(this));
    this.socket.on('error', this._error.bind(this));

    this.seenChunks = [];

    console.log("new player : ", this.id, this.socket._socket.remoteAddress, this.shouldRemove);
    this._orders = [];

  }

  get placeable(){
    this._placeable.x = this.x;
    this._placeable.y = this.y;
    this._placeable.z = this.z;
    return this._placeable;
  }

  update(serverMap, seconds) {
    if (this.stopUpdate) {
      return;
    }

    const rtLayers = [];
    for (let layer of serverMap.rtLayers) {
      rtLayers.push(serverMap.getRTLayerInfosForPosition(layer, this.x, this.y, this.z));
    }
    this._send({
      type: "RTLayers",
      datas: {
        pos: { x: this.x, y: this.y, z: this.z },
        layers: rtLayers
      }
    });
    const keys = serverMap.getChunkKeysForPlayerPosition(this.x, this.y, this.z);
    const filteredKey = keys.filter((key) => !this.seenChunks.includes(key));
    for (let key of filteredKey) {
      this._send({
        type: "mapChunk",
        datas: serverMap.getChunkForChunkKey(key)
      });
      if (key.split(':')[1] !== "0") {
        this.seenChunks.push(key);
      }
    }
    const zLevel = Math.floor(this.z);
    const placeables = serverMap.getPlaceablesForLevel(zLevel).filter((placeable) => this.id !== placeable.id);
    this._send({
      type: "placeables",
      datas: {
        zLevel,
        datas: placeables, 
      }
    });
  }

  sendHandshake(mapLoader, placeableModel) {
    this._placeable = placeableModel;
    this._placeable.id = this.id;
    this._placeable.type = 1;
    this._placeable.tick = false;

    this.x = mapLoader.mapInfos.start.x;
    this.y = mapLoader.mapInfos.start.y;
    this.z = mapLoader.mapInfos.start.z;

    this._send({
      type: "handshake",
      mapInfos: mapLoader.mapInfos,
      chunkSize: mapLoader.CHUNK_SIZE,
      id: this.id,
      definitions: {
        rtLayerDefinitions: mapLoader.definitions.rtLayerDefinitions,
        cellDefinitions: mapLoader.definitions.cellDefinitions,
        placeableDefinitions: mapLoader.definitions.placeableDefinitions,
        tintDefinitions: mapLoader.definitions.tintDefinitions,
      },
      assetNames: mapLoader.definitions.assetNames,
      start: {
        x: this.x,
        y: this.y,
        z: this.z,
      }
    });
  }

  _receiveData(data) {
    const message = JSON.parse(data);
    if (message.type === "stop") {
      console.log("stop update");
      this.stopUpdate = true;
    }
    if (message.type === "position") {
      if(message.orders.length > 0){
        console.log("player orders loaded in player : ", message.orders);
      }
      this.x = message.x;
      this.y = message.y;
      this.z = Math.floor(message.z);
      this._orders = [...message.orders, ...this._orders];
      this.dirX = message.dirX;
      this.dirY = message.dirY;
    }
  }

  get orders() {
    const orders = this._orders;
    this._orders = [];
    if(orders.length > 0){
      console.log("player orders consummed : ", orders);
    }
    return orders;
  }

  _close() {
    console.log("closed");
    this.shouldRemove = true;
  }

  _error() {
    console.log("error");
    this.shouldRemove = true;
  }

  _send(data) {
    if (this.socket.readyState === this.socket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  invalidate() {
    console.log("invalidate player : ", this.id);
    if (this.socket.readyState === this.socket.OPEN) {
      this.socket.send({
        type:"technical",
        datas: "invalidate"
      });
    }
    this.socket.close();
    this._placeable.tick = true;
  }

}

module.exports = Player;