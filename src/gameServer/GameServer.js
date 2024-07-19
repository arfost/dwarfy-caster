class GameServer {
  constructor() {
    this.players = [];
    
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    this.players = this.players.filter(p => p !== player);
  }

  getPlayers() {
    return this.players;
  }

  update(delta) {
    for(let player of this.players) {
      player.update(delta);
    }
  }

  
}