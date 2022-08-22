const Message = require('../models/message');

async function find(query) {
	let answ = [];
	let error = null;

	let promise = Message.find({roomId: query.roomId.toString()})
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

async function save(message) {
	await Message.create({
		user: message.user.toString(),
		roomId: message.roomId.toString(),
		text: message.text.toString()
	});
}

module.exports = {
	find, save
}


