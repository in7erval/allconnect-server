const mongoose = require('mongoose');
require('./user');

const Schema = mongoose.Schema;

const UserAuthSchema = new Schema({
		email: {type: String, required: true, unique: true},
		password: {type: String, required: true},
		isActivated: {type: String, default: false},
		activationLink: {type: String},
		user: {
			type: Schema.Types.ObjectId,
			unique: true, ref: 'User',
			default: new mongoose.Types.ObjectId()
		}
	},
	{
		timestamps: {
			createdAt: 'registerDate',
			updatedAt: 'updatedDate'
		}
	});

module.exports = mongoose.model('UserAuth', UserAuthSchema);


