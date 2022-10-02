const {Schema, model} = require('mongoose');
require('./user');

const TeleTokenSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: "User", unique: true},
	telegramUser: Schema.Types.String
})

module.exports = model('TeleToken', TeleTokenSchema);