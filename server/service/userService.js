const mongo = require('../db/mongo');
const {UUID} = require('bson');
const User = require('../models/user');
const {parseQuery} = require("./utils");
const Logging = require("../logging");
const ApiError = require("../exceptions/apiError");

const console = new Logging(__filename);

Array.prototype.remove = function () {
	let what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};

async function getAll(query) {
	const {limit, skipCount} = parseQuery(query);

	const promise = User.find({}).skip(skipCount).limit(limit);

	if (query.friends !== undefined) {
		promise.populate('friends');
	}

	const answ = await promise.exec()
		.then(users => {
			console.debug("found", users.length)
			return users
		}
	).catch(err => {
		console.error(err.toString());
		throw ApiError.BadRequest(`Ошибка при получении пользователей: ${err}`);
	});

	return {body: answ, count: await User.countDocuments()}
}

async function getById(id, query) {
	const promise = User.findById(id);
	if (query.friends !== undefined) {
		promise.populate('friends');
	}

	return promise.exec()
		.then(user => {
			console.debug("found", user)
			return user;
		})
		.catch(err => {
			console.info('error', err.toString());
			throw ApiError.BadRequest(`Ошибка при получении пользователя по id=${id},query=${query}: ${err}`);
		});
}

async function getUserByName(query) {
	if (query === undefined) {
		console.error(`getUserByName() => Query is not set! ${query}`);
		throw ApiError.BadRequest(`Параметр query не заполнен!`);
	}
	if (query.firstName === undefined) {
		console.error(`getUserByName() => firstName in query is not set! ${query}`);
		throw ApiError.BadRequest('Параметр firstName в query не заполнен!');
	}
	if (query.lastName === undefined) {
		console.error(`getUserByName() => lastName in query is not set! ${query}`);
		throw ApiError.BadRequest('Параметр lastName в query не заполнен!');
	}

	return User.findOne({firstName: query.firstName.toString(), lastName: query.lastName.toString()})
		.exec()
		.then(user => {
			console.debug("found", user);
			if (user == null) {
				console.error(`getUserByName() => user not found ${query}`)
				throw ApiError(`Пользователь с именем ${query.firstName.toString()} и фамилией ${query.lastName.toString()} не найден`);
			} else {
				return user;
			}
		})
		.catch(err => {
			console.error('error', err.toString());
			throw ApiError(`Ошибка при получении пользователя по имени: ${err}`);
		});
}

async function prepareForActionFriends(query, functionName) {
	if (query === undefined) {
		console.error(`${functionName}() => Query is not set! ${query}`);
		throw ApiError.BadRequest(`Параметр query не заполнен!`);
	}
	if (query.userId === undefined) {
		console.error(`${functionName}() => userId in query is not set! ${query}`);
		throw ApiError.BadRequest('Параметр userId в query не заполнен!');
	}
	if (query.friendId === undefined) {
		console.error(`${functionName}() => friendId in query is not set! ${query}`);
		throw ApiError.BadRequest('Параметр friendId в query не заполнен!');
	}

	let user1 = await User.findById(query.userId.toString()).exec()
		.catch(err => {
			console.error(`${functionName}()`, err);
			throw ApiError.BadRequest(`Ошибка при получении пользователя с id=${query.userId.toString()}, ${err}`);
		});

	let user2 = await User.findById(query.friendId.toString()).exec()
		.catch(err => {
			console.error(`${functionName}()`, err);
			throw ApiError.BadRequest(`Ошибка при получении пользователя с id=${query.friendId.toString()}, ${err}`);
		});
	return {user1, user2};
}

async function deleteFriend(query) {
	let {user1, user2} = prepareForActionFriends(query, "deleteFriend");

	user1.friends.remove(user2._id);
	user2.friends.remove(user1._id);
	await user1.save()
		.catch(err => {
			console.error("deleteFriend()", err);
			throw ApiError.BadRequest(`Ошибка при сохранении пользователя с id=${user1._id}, ${err}`);
		});
	await user2.save()
		.catch(err => {
			console.error("deleteFriend()", err);
			throw ApiError.BadRequest(`Ошибка при сохранении пользователя с id=${user2._id}, ${err}`);
		});
	return {body: {}};
}

async function addFriend(query) {
	let {user1, user2} = prepareForActionFriends(query, "addFriend");

	if (!user1.friends.includes(user2._id)) {
		user1.friends.push(user2._id);
		await user1.save()
			.catch(err => {
				console.error("addFriend()", err);
				throw ApiError.BadRequest(`Ошибка при сохранении пользователя с id=${user1._id}, ${err}`);
			});
	}
	if (!user2.friends.includes(user1._id)) {
		user2.friends.push(user1._id);
		await user2.save()
			.catch(err => {
				console.error("addFriend()", err);
				throw ApiError.BadRequest(`Ошибка при сохранении пользователя с id=${user2._id}, ${err}`);
			});
	}
	return {body: {}};
}

async function updateOne(body) {
	const userId = body.userId.toString();

	delete body.userId;

	body = JSON.parse(JSON.stringify(body));

	await User.updateOne({_id: userId}, body).exec()
		.then(val => {
			console.debug(val);
		})
		.catch(err => {
			console.error("updateOne()", err);
			throw ApiError.BadRequest(`Ошибка при обновлении пользователя с id=${userId}, ${err}`);
		});
	return {body: {}}

}


module.exports = {
	getAll,
	getById,
	getUserByName,
	deleteFriend,
	addFriend,
	updateOne
}


