const {Schema, model} = require('mongoose');
require('./user');
require('./userAuth');

const TokenSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: "UserAuth"},
	userAuth: {type: Schema.Types.ObjectId, ref: "User"},
	refreshToken: {type: String, required: true}
})

module.exports = model('Token', TokenSchema);