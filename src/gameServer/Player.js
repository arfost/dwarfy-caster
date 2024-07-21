class Player {
  constructor(ws, start) {
    this.ws = ws;

    this.id = Math.ceil(Math.random()*1000000);

    this.ws.on('message', this._receiveData.bind(this));
    this.ws.on('close', this._close.bind(this));
    this.ws.on('error', this._error.bind(this));

    this.seenChunks = [];

  }

  get placeable(){
    const placeable = {
      id: this.id,
      x: this.x,
      y: this.y,
      z: this.z,
      type: 1,
    }
    return placeable;
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
      console.log("sending chunk", key);
      this._send({
        type: "mapChunk",
        datas: serverMap.getChunkForChunkKey(key)
      });
      if (key.split(':')[1] !== "0") {
        this.seenChunks.push(key);
      }
    }
    const zLevel = Math.floor(this.z);
    this._send({
      type: "placeables",
      datas: {
        zLevel,
        datas: serverMap.getPlaceablesForLevel(zLevel).filter((placeable) => this.id !== placeable.id)
      }
    });
  }

  sendHandshake(mapLoader) {
    this.x = mapLoader.mapInfos.start.x;
    this.y = mapLoader.mapInfos.start.y;
    this.z = mapLoader.mapInfos.start.z;

    this._send({
      type: "handshake",
      mapInfos: mapLoader.mapInfos,
      chunkSize: mapLoader.CHUNK_SIZE,
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
      this.x = message.x;
      this.y = message.y;
      this.z = Math.floor(message.z);
    }
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
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  invalidate() {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send("invalidate");
    }
    this.ws.close();
    this.shouldRemove = true;
  }

}

module.exports = Player;