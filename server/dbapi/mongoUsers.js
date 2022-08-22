const mongo = require('./mongo');
const {UUID} = require('bson');
const User = require('../models/user');
const {parseQuery} = require("./mongo");

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
	let answ = [];
	let error = null;

	const {limit, skipCount} = parseQuery(query);

	if (limit === null || skipCount === null) {
		return {body: null, error: {msg: "query is not valid", code: -1}}
	}

	const promise = User.find({}).skip(skipCount).limit(limit);

	if (query.friends !== undefined) {
		promise.populate('friends');
	}
	await promise.exec().then((users, err) => {
		if (err) {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		} else {
			console.log("found", users.length)
			answ.push(...users);
		}
	});

	return {body: answ, count: await User.countDocuments(), error}
}

async function getById(id, query) {
	let answ = {};
	let error = null;

	const promise = User.findById(id);
	if (query.friends !== undefined) {
		promise.populate('friends');
	}

	await promise.exec()
		.then(user => {
			console.log("found", user)
			answ = user;
		})
		.catch(err => {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		});

	return {body: answ, error}
}

async function getUserByName(query) {
	let error = null;
	let answ = null;

	if (query === undefined) {
		return {
			body: answ, error: {
				msg: 'query is not set!',
				code: -1
			}
		};
	}
	if (query.firstName === undefined) {
		return {
			body: answ, error: {
				msg: 'firstName is not set!',
				code: -1
			}
		};
	}
	if (query.lastName === undefined) {
		return {
			body: answ, error: {
				msg: 'lastName is not set!',
				code: -1
			}
		};
	}

	await User.findOne({firstName: query.firstName, lastName: query.lastName})
		.exec()
		.then(user => {
			console.log("found", user);
			if (user == null) {
				error = {msg: "User not found", code: -1};
			} else {
				answ = user;
			}
		})
		.catch(err => {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		});

	return {body: answ, error};
}

async function deleteFriend(query) {
	let error = null;

	if (query === undefined) {
		return {
			body: null, error: {
				msg: 'query is not set!',
				code: -1
			}
		};
	}
	if (query.userId === undefined) {
		return {
			body: null, error: {
				msg: 'userId is not set!',
				code: -1
			}
		};
	}
	if (query.friendId === undefined) {
		return {
			body: null, error: {
				msg: 'friendId is not set!',
				code: -1
			}
		};
	}

	let user1 = {};

	await User.findById(query.userId).exec()
		.then(inst => {
			user1 = inst;
		})
		.catch(err => {
			console.log(err);
			error = {msg: err.message, code: err.value};
		});


	if (error !== null) {
		return {body: null, error};
	}

	let user2 = {};

	await User.findById(query.friendId).exec()
		.then(inst => {
			user2 = inst;
		})
		.catch(err => {
			console.log(err);
			error = {msg: err.message, code: err.value};
		});

	if (error !== null) {
		return {body: null, error};
	}
	user1.friends.remove(user2._id);
	user2.friends.remove(user1._id);
	await user1.save()
		.catch(err => {
			console.log(err);
			error = {msg: err.message, code: err.value};
		});
	await user2.save()
		.catch(err => {
			console.log(err);
			error = {msg: err.message, code: err.value};
		});
	return {body: {}, error: null};
}

async function addFriend(query) {
	let error = null;

	if (query === undefined) {
		return {
			body: null, error: {
				msg: 'query is not set!',
				code: -1
			}
		};
	}
	if (query.userId === undefined) {
		return {
			body: null, error: {
				msg: 'userId is not set!',
				code: -1
			}
		};
	}
	if (query.friendId === undefined) {
		return {
			body: null, error: {
				msg: 'friendId is not set!',
				code: -1
			}
		};
	}

	let user1 = {};

	await User.findById(query.userId).exec()
		.then(inst => {
			user1 = inst;
		})
		.catch(err => {
			console.log(err);
			error = {msg: err.message, code: err.value};
		});


	if (error !== null) {
		return {body: null, error};
	}

	let user2 = {};

	await User.findById(query.friendId).exec()
		.then(inst => {
			user2 = inst;
		})
		.catch(err => {
			console.log(err);
			error = {msg: err.message, code: err.value};
		});

	if (error !== null) {
		return {body: null, error};
	}

	user1.friends.push(user2._id);
	user2.friends.push(user1._id);
	await user1.save()
		.catch(err => {
			console.log(err);
			error = {msg: err.message, code: err.value};
		});
	await user2.save()
		.catch(err => {
			console.log(err);
			error = {msg: err.message, code: err.value};
		});
	return {body: {}, error: error};
}

async function updateOne(body) {
	const userId = body.userId;

	delete body.userId;

	let error = null;

	await User.updateOne({_id: userId}, body).exec()
		.then(val => {
			console.log(val);
		})
		.catch(err => {
			console.error(err);
			error = {msg: err.message, code: err.value};
		});
	return {body: {}, error}

}


module.exports = {
	getAll,
	getById,
	getUserByName,
	deleteFriend,
	addFriend,
	updateOne
}


