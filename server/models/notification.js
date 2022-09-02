const mongoose = require('mongoose');
const bodyParser = require("body-parser");

const notificationSchema = new mongoose.Schema({
		type: {
			type: String,
			required: true,
		},
		forUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		seen: {type: Boolean, required: true, default: false},
		additionalInfo: mongoose.Schema.Types.Mixed
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model('Notification', notificationSchema);