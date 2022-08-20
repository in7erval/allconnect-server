const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
		// messageType: {
		// 	type: String,
		// 	required: true
		// },
		text: {
			type: String,
			required: true
		},
		roomId: {
			type: String,
			required: true
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model('Message', messageSchema);