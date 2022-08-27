const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UsersStatusSchema = new Schema({
		user: {type: Schema.Types.ObjectId, ref: 'User', unique: true},
		lastConnection: Date,
		socketId: {type: String, unique: true},
		connected: {type: Boolean, default: false}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model('UsersStatus', UsersStatusSchema);


