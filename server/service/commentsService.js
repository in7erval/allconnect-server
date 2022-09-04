const Comment = require('../models/comment');
const Post = require('../models/post');
const {parseQuery} = require("./utils");
const mongoose = require("mongoose");
const {addNotificationForComment} = require("./notificationsService");

const Logging = require("../logging");
const ApiError = require("../exceptions/apiError");
const console = new Logging(__filename);

async function getAll(query) {
	const {limit, skipCount} = parseQuery(query);

	const filter = (query.postId == undefined || query.postId == null) ? {} : {post: query.postId};

	const promise = Comment.find(filter)
		.sort({publishDate: -1})
		.skip(skipCount).limit(limit);

	if (query.owner !== undefined) {
		promise.populate('owner');
	}
	if (query.post !== undefined) {
		promise.populate('post');
	}

	const answ = await promise.exec()
		.then((comments) => {
			console.debug("found", comments.length);
			return comments;
		})
		.catch(err => {
			console.error('error', err.toString());
			throw ApiError.BadRequest(`Ошибка при получении комментариев query=${query}. ${err}`);
		});

	return {body: answ, count: await Comment.countDocuments()}
}

async function getById(id, query) {
	const promise = Comment.findById(id);

	if (query.owner !== undefined) {
		promise.populate('owner');
	}
	if (query.post !== undefined) {
		promise.populate('post');
	}

	const comment = await promise.exec()
		.then(commentFound => {
			console.debug("found", commentFound);
			return commentFound;
		})
		.catch(error => {
			console.error('error', error.toString());
			throw ApiError.BadRequest(`Ошибка при получении комментариев по id=${id} query=${query}. ${error}`);
		});

	return {body: comment, count: await Comment.countDocuments()}
}

async function addComment(body) {
	const {postId, userId, text} = body;
	let answ = {};

	const newComment = new Comment({
		message: text,
		owner: new mongoose.Types.ObjectId(userId),
		post: new mongoose.Types.ObjectId(postId)
	});

	await Post.findById(postId).exec()
		.then(post => {
			post.comments.push(newComment._id);
			return Promise.all([
				post.save(),
				newComment.save(),
				addNotificationForComment(postId, userId, post.owner)
			]);
		})
		.then(res => {
			console.debug(res);
			return res[1].populate('owner')
		})
		.then(res => res.populate('post'))
		.then(res => {
			console.debug("populated comment ", res);
			answ = res;
		})
		.catch(err => {
			console.error("error when adding comment", err);
			throw ApiError.BadRequest(`Ошибка при добавлении комментария body=${JSON.stringify(body)}. ${err}`);
		});

	return {body: answ};
}


module.exports = {
	addComment,
	getAll,
	getById
}

