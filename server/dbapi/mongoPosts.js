const Post = require('../models/post');
const User = require('../models/user');
const {parseQuery} = require("./mongo");

function valueInArray(value, array) {
	for (let val of array) {
		if (val === value) {
			return true;
		}
	}
	return false;
}

async function getAll(query) {
	let answ = [];
	let error = null;
	let forUser = null;

	const {limit, skipCount} = parseQuery(query);

	if (limit === null || skipCount === null) {
		return {body: null, error: {msg: "query is not valid", code: -1}}
	}

	let promise;
	let count;

	if (query.userId !== undefined) {
		await User.findById(query.userId).exec()
			.then(res => {
				console.log('user found', res);
				forUser = res;
			})
			.catch(err => {
				console.log('error', err.toString());
				error = {msg: err.toString(), code: -1};
			})
	}

	if (forUser) {
		console.log("friends", forUser.friends);
		promise = Post.find({owner: {'$in': forUser.friends}});
		count = await Post.countDocuments({owner: {'$in': forUser.friends}})
	} else {
		promise = Post.find({});
		count = await Post.countDocuments();
	}

	promise
		.sort({publishDate: -1})
		.skip(skipCount).limit(limit);

	if (query.owner !== undefined) {
		promise.populate('owner');
	}
	if (query.comments !== undefined) {
		promise.populate({path: 'comments', populate: {path: 'owner'}})
	}

	await promise.exec()
		.then(posts => {
			console.log("found", posts.length);
			answ.push(...posts);
		})
		.catch(err => {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		});

	return {body: answ, count: count, error}
}

async function getById(id, query) {
	let answ = {};
	let error = null;

	const promise = Post.findById(id);
	if (query.owner !== undefined) {
		promise.populate('owner');
	}
	if (query.comments !== undefined) {
		promise.populate({path: 'comments', populate: {path: 'owner'}, options: {sort: {'publishDate': -1}}})
	}

	await promise.exec().then((post, err) => {
		if (err) {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		} else {
			console.log("found", post);
			answ = post;
		}
	});

	return {body: answ, count: await Post.countDocuments(), error}
}

async function getAllByOwner(owner, query) {
	let answ = [];
	let error = null;

	const {limit, skipCount} = parseQuery(query);

	if (limit === null || skipCount === null) {
		return {body: null, error: {msg: "query is not valid", code: -1}}
	}

	const promise = Post.find({owner})
		.sort({publishDate: -1})
		.skip(skipCount).limit(limit);

	if (query.owner !== undefined) {
		promise.populate('owner');
	}
	if (query.comments !== undefined) {
		promise.populate({path: 'comments', populate: {path: 'owner'}, options: {sort: {'publishDate': -1}}});
	}

	await promise.exec()
		.then(posts => {
			console.log("found", posts.length);
			answ.push(...posts);
		})
		.catch(err => {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		});

	return {body: answ, count: await Post.countDocuments({owner}), error}
}

async function addPost(post) {
	let res = {};
	let error = null;
	const postItem = new Post({
		...post
	});

	console.log("postItem", postItem);

	await postItem.save()
		.then(res => {
			console.log("post saved", res);
		})
		.catch(err => {
			console.error(err);
			error = err;
		})

	return {body: res, error};
}

async function actionWithLike(postId, userId, action) {
	let res = {};
	let error = null;

	let toAdd = action.add !== undefined;
	let toDelete = action.delete !== undefined;
	if (toAdd && toDelete) {
		// todo: ERROR
	}

	let post = await Post.findById(postId).exec();

	if (toAdd) {
		post.likes = [...post.likes, userId];
	}
	if (toDelete) {
		post.likes = post.likes.filter(el => el.toString !== userId);
	}

	await post.save();

	return {body: res, error};
}

module.exports = {
	getAll,
	getById,
	getAllByOwner,
	addPost,
	actionWithLike
}

