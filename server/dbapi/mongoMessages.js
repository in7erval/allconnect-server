const Message = require('../models/message');

async function find(query) {
	let answ = [];
	let error = null;

	let promise = Message.find({roomId: query.roomId})
		.sort({createdAt: -1});


	if (query.last) {
		promise = promise.limit(1);
	}

	promise.populate('user');

	await promise.exec().then((messages, err) => {
		if (err) {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		} else {
			console.log("found", messages.length)
			answ.push(...messages);
		}
	});

	return {body: answ, error}
}

module.exports = {
	find
}

// exports.getAll = getAll;
// exports.getById = getById;
// exports.getUserComments = getUserComments;
// exports.getUserPosts = getUserPosts;
// exports.insertUser = insertUser;
// exports.getUserByName = getUserByName;
// exports.deleteFriend = deleteFriend;
// exports.addFriend = addFriend;
// exports.changeName = changeName;
// exports.setPhoto = setPhoto;


