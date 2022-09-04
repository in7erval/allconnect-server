const Post = require('../models/post');
const User = require('../models/user');
const {parseQuery} = require("./utils");
const {addNotificationForLike} = require("./notificationsService");
const Logging = require("../logging");
const ApiError = require("../exceptions/apiError");

const console = new Logging(__filename);

async function getAll(query) {
	let forUser = null;

	const {limit, skipCount} = parseQuery(query);

	let promise;
	let count;

	if (query.userId !== undefined) {
		forUser = await User.findById(query.userId).exec()
			.catch(err => {
				console.error('error', err.toString());
				throw ApiError.BadRequest(`Ошибка при получении пользователя по ${query.userId} для получения постов`);
			})
	}

	if (forUser) {
		console.debug("friends", forUser.friends);
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

	let answer = await promise.exec()
		.catch(err => {
			console.error('error', err.toString());
			throw ApiError.BadRequest(`Ошибка при получении постов, query=${query}, error=${error}`);
		});

	// console.info("answer getAll", answer);

	return {body: answer, count: count}
}

async function getAllForOwner(owner, query) {
	const {limit, skipCount} = parseQuery(query);

	const promise = Post.find({owner})
		.sort({publishDate: -1})
		.skip(skipCount).limit(limit);

	if (query.owner !== undefined) {
		promise.populate('owner');
	}
	if (query.comments !== undefined) {
		promise.populate({path: 'comments', populate: {path: 'owner'}, options: {sort: {'publishDate': -1}}});
	}

	let answ = await promise.exec()
		.catch(err => {
			console.error('error', err.toString());
			throw ApiError.BadRequest(`Ошибка при получении постов для пользователя ${owner}, error=${error}`);
		});

	return {body: answ, count: await Post.countDocuments({owner})}
}

async function getById(id, query) {
	const promise = Post.findById(id);
	if (query.owner !== undefined) {
		promise.populate('owner');
	}
	if (query.comments !== undefined) {
		promise.populate({
			path: 'comments',
			populate: {path: 'owner'},
			options: {sort: {'publishDate': -1}}
		})
	}

	let answer = await promise.exec()
		.catch(error => {
			console.error('error', error.toString());
			throw ApiError.BadRequest(`Ошибка при получении постов по id=${id}, query=${query}, error=${error}`);
		});

	return {body: answer, count: await Post.countDocuments()}
}

async function addPost(post) {
	const postItem = await Post.create({...post})
		.catch(err => {
			console.error(err);
			throw ApiError.BadRequest(`Ошибка при добавлении поста ${post}, error=${err}`);
		})

	return {body: postItem};
}

async function actionWithLike(postId, userId, action) {
	let res = {};

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

	await post.save()
		.then((result) => console.debug("successfully saved post", result))
		.catch(err => {
			console.error("error when saving post", err);
			throw ApiError.BadRequest(`Ошибка при сохранении поста(${userId}) с лайком от пользователя с ${userId}, ${action}, ${error}`);
		});

	if (toAdd) {
		try {
			await addNotificationForLike(postId, userId, post.owner);
		} catch (error) {
			console.error("error when adding notification after liking post", error);
			throw ApiError.BadRequest(`Ошибка при создании уведомления ${error}`);
		}
	}
	return {body: res};
}

module.exports = {
	getAll,
	getById,
	getAllForOwner,
	addPost,
	actionWithLike
}

