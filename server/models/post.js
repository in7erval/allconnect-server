const mongoose = require('mongoose');
const {UUID} = require('bson');
require('./user');
require('./comment');

const Schema = mongoose.Schema;

const PostsSchema = new Schema({
		image: String,
		likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
		text: {type: String, default: ""},
		owner: {
			type: mongoose.Schema.Types.ObjectId, ref: 'User'
		},
		comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
	},
	{
		timestamps: {
			createdAt: 'publishDate',
			updatedAt: 'updatedDate'
		}
	});

module.exports = mongoose.model('Post', PostsSchema);


