class Games{
	constructor(){
		this.games = [];
	}
	addGame(gameId,player){
		var answers = [];
		var players = [player];
		var host = player;
		var game = {gameId, players, answers, host};
		this.games.push(game);
	}
	addPlayerToGame(gameId, player){
		this.games.find((game) => game.gameId === gameId).players.push(player);
	}
	removePlayerToGame(gameId, playerId){
		var game = this.games.find((game) => game.gameId === gameId);
		console.log(game);
		var players = game.players.filter((player) => player.playerId !== playerId);
		this.games.find((game) => game.gameId === gameId).players = players;	
	}
	getGame(gameId){
		return this.games.find((game) => game.gameId === gameId);
	}
	existGame(gameId){
		return (this.games.find((game) => game.gameId === gameId) !== undefined);
	}
	removeGame(gameId){
		var game = this.getGame(gameId);
		if (game){
			this.games = this.games.filter((game) => game.gameId !== gameId);
		}
	}
}

module.exports = {Games};

