var socket = io();

$(document).ready(function(){
	$('#gameArea').html( $('#intro-template').html());
	
	$(document).on('click', '#btnCreateGame', function(){
		$('#btnCreateGame').on("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event) {
			socket.emit('addPlayer', $('#inputPlayerName').val());
			$('#gameArea').html($('#game-room-host-template').html());
			socket.emit('hostCreateNewGame');
		});
	});
	$(document).on('click','#btnJoinGame', function(){
		$('#btnJoinGame').prop('disabled', true);
		$('#btnJoinGame').on("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event) {
			socket.emit('addPlayer', $('#inputPlayerName').val());
			$('#gameArea').html($('#join-game-template').html());
		});
	});
	$(document).on('click','#btnRoomGame', function(){
		$('#btnRoomGame').on("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event) {
			var roomCode = $('#inputRoom').val();
			socket.emit('playerJoinGame', {playerId: socket.id, gameId: $('#inputRoom').val()});
		});
	});
	$(document).on('click', '#btnStartGame', function(){
		$('#btnStartGame').on("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event) {
			socket.emit('startGame');
		});
	});
	$(document).on('click', '#btnSendQuestion', function(){
		$('#btnSendQuestion').on("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event) {
			socket.emit('sendQuestion', $('#inputQuestion').val());
		});
	});
	$(document).on('click', '#btnAnswerQuestion', function(){
		var button = $(this);
		$('#players').on("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(event) {
			console.log("REspuesta enviada");
			button.addClass('activeBtn');
			$('#players button').not(button).addClass('inactiveBtn');
			$('#players :input').attr('disabled', true);	
			socket.emit('sendAnswer', {player: socket.id, answer:button.val()});
		});
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
	
	socket.on('setUpGame', (host) =>{
		$('#players :input').attr('disabled', false);	
		if (socket.id == host.playerId){
			$('#gameArea').html($('#game-questions-template').html());
		}
		else{
			$('#gameArea').html($('#game-answers-template').html());	
			$('#playerAsking').text("It's the turn of "+ host.nickname);
		}
	});
	socket.on('receiveQuestions', (data) =>{
		$('#playerAsking').text(data.host.nickname+" asks: ");
		$('#question').text(data.question);
		$('#players').empty();
		data.players.filter((player) => player.playerId != data.host.playerId).forEach(player => $('#players').append( "<button id='btnAnswerQuestion' class='btnAnswer' value="+player.playerId.toString()+" >"+ player.nickname.toString() + "</button>"));
	});
	socket.on('seeAnswers', (question) =>{
		$('#gameArea').html($('#game-see-answers-template').html());
		$('question').text(question);
	});
	socket.on('addAnswer', (data) =>{
		//if ($('#no-answers').length) $('#answers').empty();
		$('<p>'+data.player+' says '+data.answer+'</p>').appendTo('#answers');
	});
	
});
