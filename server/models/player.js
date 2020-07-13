var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var playerSchema = new Schema({
	"_id": false,
	playerId: {type: String, unique: true},
	nickname: String
});

module.exports = mongoose.model('Player', playerSchema);
