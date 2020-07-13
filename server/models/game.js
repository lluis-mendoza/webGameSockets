var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var player = require('./player').schema;

var gameSchema = new Schema({
	gameId: {type: String, unique: true, index: true, required: true},
	state: String,
	players: [player]	
});


module.exports = mongoose.model('Game', gameSchema);
