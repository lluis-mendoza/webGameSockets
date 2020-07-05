const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const {Players} = require('./utils/players');
const {Games} = require('./utils/games');

const app = express();
const server = http.createServer(app);

var PORT = 3000;

const clientPath = `${__dirname}/../client`;
console.log(`Serving static from ${clientPath}`);
app.use(express.static(clientPath));

app.get('/', function(req, res){
	res.sendFile(clientPath+'/index.html');
});

var players = new Players();
var games = new Games();

const io = socketio(server);
io.on('connection', (sock) => {
	console.log("New client: " + sock.id);
	sock.on('addPlayer', (nickname)=>{
		players.addPlayer(sock.id, nickname);
	})
	sock.on('hostCreateNewGame', ()=>{
		var _gameId = ((Math.random()*100000) | 0).toString();
		players.setGameId(sock.id, _gameId);
		games.addGame(_gameId, players.getPlayer(sock.id));
		sock.emit('newGameCreatedByHost', {gameId: _gameId, nickname: players.getPlayer(sock.id).nickname});
		sock.join(_gameId);
	});
	sock.on('playerJoinGame', (data) =>{
		if (games.existGame(data.gameId)){
			games.addPlayerToGame(data.gameId, players.getPlayer(data.playerId));
			players.setGameId(sock.id, data.gameId);
			io.sockets.in(data.gameId).emit('setPlayerInRoom', players.getPlayer(data.playerId).nickname);
			sock.join(data.gameId);
			sock.emit('playerJoinGameSuccess', data.gameId);
			sock.emit('setPlayersInRoom', games.getGame(data.gameId).players);
		}
		else{
			console.log("The game dont exist");
			sock.emit('playerJoinGameFail');
		}
	});
	sock.on('startGame', ()=>{
		if (players.getPlayer(sock.id) === undefined) return;
		var gameId = players.getPlayer(sock.id).gameId;
		io.sockets.in(gameId).emit('setUpGame', games.getGame(gameId).host);
	});
	sock.on('sendQuestion', (_question) =>{
		if (players.getPlayer(sock.id) === undefined) return;
		var gameId = players.getPlayer(sock.id).gameId;
		sock.emit('seeAnswers', _question);
		io.sockets.in(gameId).emit('receiveQuestions', {players: games.getGame(gameId).players, host: games.getGame(gameId).host, question: _question});
	});
	sock.on('sendAnswer', (data) =>{
		if (players.getPlayer(data.player) === undefined) return;
		var gameId = players.getPlayer(data.player).gameId;
		if (games.getGame(gameId).answers.find((answer) => answer.player == data.player) === undefined){
			games.getGame(gameId).answers.push(data);
			var game = games.getGame(gameId);
			io.sockets.to(game.host.playerId).emit('addAnswer', {player: players.getPlayer(data.player).nickname, answer: players.getPlayer(data.answer).nickname});
			if (game.answers.length >= game.players.length-1){ 
				var host = game.host;
				var answersSet = (new Set(game.answers.map(a => a.answer)));
				if (answersSet.size == 2){
					var val1 = Array.from(answersSet)[0];
					var val2 = Array.from(answersSet)[1]; 
					var num1 = game.answers.filter(x => x.answer == val1).length;
					var num2 = game.answers.filter(x => x.answer == val2).length;
					if (num1 > 1 && num2==1){
						host = players.getPlayer(game.answers.find((answer) => answer.answer == val2).player);
					}
					else if (num1==1 && 1 < num2){
						host = players.getPlayer(game.answers.find((answer) => answer.answer == val1).player);
					}

				}
				setTimeout(()=>{
					games.getGame(gameId).host = host;
					io.sockets.in(gameId).emit('setUpGame', games.getGame(gameId).host);
					games.getGame(gameId).answers = [];
				}, 4000);


			}
		}

	});
	sock.on('disconnect', function(){
		console.log("The user "+sock.id+" has been desconected!");
		if (players.existPlayer(sock.id) && players.getPlayer(sock.id).gameId !== undefined){
			var gameId = players.getPlayer(sock.id).gameId;
			games.removePlayerToGame(gameId, sock.id);
			players.removePlayer(sock.id);
			sock.leave(gameId);
			if (games.getGame(gameId).players.length == 0) games.removeGame(gameId);
			else io.sockets.in(gameId).emit('setPlayersInRoom', games.getGame(gameId).players);
		}
	});
});

server.on('error', (err) =>{
	console.error('Server error: ', err);
});

server.listen(PORT, ()=>{
	console.log('Server started on ', PORT);
});
