const Player = require('./Player.js');
const ServerMap = require('./ServerMap.js');

class GameServer {
  constructor(mapLoader) {
    this.players = [];
    this.serverMap = new ServerMap(mapLoader);
  }

  async init() {
    await this.serverMap.initMap();
    
  }

  addPlayer(socket) {
    const player = new Player(socket);
    this.players.push(player);
    player.sendHandshake(this.serverMap.mapLoader, this.serverMap.getPlaceableModel());
  }

  removePlayer(socket) {
    this.players = this.players.filter(p => p.socket !== socket);
  }

  update(delta) {
    this.serverMap.update(this.players, delta);
    this.players.forEach(player => {
      player.update(this.serverMap, delta);
      if(player.shouldRemove){
        this.removePlayer(player.socket);
        player.invalidate();
      }
    });
  }
}

module.exports = { GameServer };