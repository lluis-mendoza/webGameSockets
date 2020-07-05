var socket = io();

$(document).ready(function(){
	$('#gameArea').html( $('#intro-template').html());
	
	$(document).on('click', '#btnCreateGame', function(){
		socket.emit('addPlayer', $('#inputPlayerName').val());
		$('#gameArea').html($('#game-room-host-template').html());
		socket.emit('hostCreateNewGame');
	})
	$(document).on('click','#btnJoinGame', function(){
		socket.emit('addPlayer', $('#inputPlayerName').val());
		$('#gameArea').html($('#join-game-template').html());
	});
	$(document).on('click','#btnRoomGame', function(){
		var roomCode = $('#inputRoom').val();
		socket.emit('playerJoinGame', {playerId: socket.id, gameId: $('#inputRoom').val()});
	});
	$(document).on('click', '#btnStartGame', function(){
		socket.emit('startGame');
	});
	$(document).on('click', '#btnSendQuestion', function(){
		socket.emit('sendQuestion', $('#inputQuestion').val());
	});
	$(document).on('click', '#btnAnswerQuestion', function(){
		$('#players button').not(this).removeClass('activeBtn');
		$('#players button').not(this).addClass('inactiveBtn');
		$('#players :input').attr('disabled', true);	
		socket.emit('sendAnswer', {player: socket.id, answer: $(this).val()});
	});
	socket.on('newGameCreatedByHost', (data)=>{
		$('#newGameCode').text(data.gameId);
		$('<p>'+data.nickname+'</p>').appendTo('#playersWaiting');
	});
	socket.on('setPlayerInRoom', (nickname) =>{
		console.log("The player "+ nickname+" joined the game!");
		$('<p>'+nickname+'</p>').appendTo('#playersWaiting');
	});
	socket.on('setPlayersInRoom', (players) =>{
		$('#playersWaiting').empty();
		players.forEach(player => $('<p>'+player.nickname+'</p>').appendTo('#playersWaiting'));
	});
	socket.on('playerJoinGameSuccess', (gameId) =>{
		$('#gameArea').html($('#game-room-client-template').html());
		$('#newGameCode').text(gameId);
	});
	
	socket.on('setUpGame', (hostId) =>{
		$('#players :input').attr('disabled', false);	
		if (socket.id === hostId){
			$('#gameArea').html($('#game-questions-template').html());
		}
		else{
			$('#gameArea').html($('#game-answers-template').html());	
		}
	});
	socket.on('receiveQuestions', (data) =>{
		$('#question').text(data.question);
		data.players.filter((player) => player.playerId !== data.hostId).forEach(player => $('<button id="btnAnswerQuestion" value='+player.playerId+' >'+ player.nickname + '</button>').appendTo('#players'));
		$('#players button').addClass('activeBtn');
	});
	socket.on('seeAnswers', (question) =>{
		$('#gameArea').html($('#game-see-answers-template').html());
		$('question').text(question);
	});
	socket.on('addAnswer', (data) =>{
		$('<p>'+data.player+' says '+data.answer+'</p>').appendTo('#answers');
	});
	
});
