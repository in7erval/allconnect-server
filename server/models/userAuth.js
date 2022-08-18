const mongoose = require('mongoose');
require('./user');

const Schema = mongoose.Schema;

const UsersAuthSchema = new Schema({
		login: {type: String, required: true, unique: true},
		loginPassBase64: {type: String, required: true, unique: true},
		user: {
			type: Schema.Types.ObjectId,
			unique: true, required: true, ref: 'User',
			default: new mongoose.Types.ObjectId()
		}
	},
	{
		timestamps: {
			createdAt: 'registerDate',
			updatedAt: 'updatedDate'
		}
	});

UsersAuthSchema.virtual('password')
	.set(function (value, virtual, doc) {
		this.loginPassBase64 = btoa(`${doc.login}:${value}`);
	});

module.exports = mongoose.model('UserAuth', UsersAuthSchema);

