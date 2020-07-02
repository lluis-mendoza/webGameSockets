class Players{
	constructor(){
		this.players = [];
	}
	addPlayer(playerId, nickname){
		var gameId = undefined;
		var player = {playerId, nickname, gameId};
		this.players.push(player);
	}
	removePlayer(playerId){
		var player = this.getPlayer(playerId);
		if (player){
			this.players = this.players.filter((player) => player.playerId !== playerId);
		}
	}
	getPlayer(playerId){
		return this.players.find((player) => player.playerId === playerId);
	}
	setGameId(playerId, gameId){
		this.players.find((player) => player.playerId === playerId).gameId = gameId;
	}
	existPlayer(playerId){
		return (this.players.find((player) => player.playerId === playerId) !== undefined);
	}
}

module.exports = {Players};
