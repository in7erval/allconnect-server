const mongoose = require('mongoose');
require('./user');
require('./post');

const Schema = mongoose.Schema;

const CommentsSchema = new Schema({
		message: {type: String, required: true},
		owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
	},
	{
		timestamps: {
			createdAt: 'publishDate',
			updatedAt: 'updatedDate'
		}
	});

module.exports = mongoose.model('Comment', CommentsSchema);


