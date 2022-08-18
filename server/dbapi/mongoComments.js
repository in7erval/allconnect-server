const Comment = require('../models/comment');
const Post = require('../models/post');
const {parseQuery} = require("./mongo");
const mongoose = require("mongoose");

async function getAll(query) {
	let answ = [];
	let error = null;

	const {limit, skipCount} = parseQuery(query);

	if (limit === null || skipCount === null) {
		return {body: null, error: {msg: "query is not valid", code: -1}}
	}

	const promise = Comment.find({})
		.sort({publishDate: -1})
		.skip(skipCount).limit(limit);

	if (query.owner !== undefined) {
		promise.populate('owner');
	}
	if (query.post !== undefined) {
		promise.populate('post');
	}

	await promise.exec().then((comments, err) => {
		if (err) {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		} else {
			console.log("found", comments.length);
			answ.push(...comments);
		}
	});

	return {body: answ, count: await Comment.countDocuments(), error}
}

async function getById(id, query) {
	let comment = {};
	let error = null;

	const promise = Comment.findById(id);

	if (query.owner !== undefined) {
		promise.populate('owner');
	}
	if (query.post !== undefined) {
		promise.populate('post');
	}

	await promise.exec().then((commentFound, err) => {
		if (err) {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		} else {
			console.log("found", commentFound);
			comment = commentFound;
		}
	});

	return {body: comment, count: await Comment.countDocuments(), error}
}

async function addComment(body) {
	const {postId, userId, text} = body;
	let error = null;
	let answ = {};

	const newComment = new Comment({
		message: text,
		owner: new mongoose.Types.ObjectId(userId),
		post: new mongoose.Types.ObjectId(postId)
	});

	await Post.findById(postId).exec()
		.then(post => {
			console.log("post found", post);
			console.log("comment id", newComment._id);
			post.comments.push(newComment._id);
			return Promise.all([post.save(),
				newComment.save()]);
		})
		.then(res => {
			console.log(res);
			return res[1].populate('owner')
		})
		.then(res => res.populate('post'))
		.then(res => {
			console.log("COMMENT ", res);
			answ = res;
		})
		.catch(err => {
			console.error(err);
			error = err;
		});

	if (error != null) {
		return {body: answ, error};
	}

	return {body: answ, error};
}


module.exports = {
	addComment,
	getAll,
	getById
}

