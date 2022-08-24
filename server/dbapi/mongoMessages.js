const Message = require('../models/message');
const ObjectId = require('mongodb').ObjectId;

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
	return Message.create({
		user: message.user.toString(),
		roomId: message.roomId.toString(),
		text: message.text.toString(),
		seenBy: [message.user.toString()]
	});
}

async function findAllRooms(userId) {
	let messages = [];
	let error = null;
	userId = userId.toString()
	console.log("findAllRooms", userId);
	console.log(new RegExp(`(${userId}:\\w+)|(\\w+:${userId})`, 'g'));

	await Message.aggregate([
		{"$match": {roomId: {"$regex": new RegExp(`(${userId}:\\w+)|(\\w+:${userId})`, 'g')}}},
		{"$sort": {createdAt: -1}},
		{
			"$group": {
				_id: "$roomId",
				text: {
					$first: "$text"
				},
				seenBy: {
					$first: "$seenBy"
				},
				createdAt: {
					$first: "$createdAt"
				}
			}
		},
		{
			"$addFields":
				{
					user: {
						$map: {
							input: {$split: ["$_id", ":"]},
							as: "users",
							in: "$$users"
						}
					}
				}
		},
		{
			"$addFields":
				{
					user: {
						$filter: {
							input: "$user",
							as: "user",
							cond: {$ne: ["$$user", userId]}
						}
					}
				}
		},
		{
			"$addFields":
				{
					user: {
						$map: {
							input: "$user",
							as: "user",
							in: {$toObjectId: "$$user"}
						}
					},
				}
		},
		{
			"$lookup": {
				from: "users",
				localField: "user",
				foreignField: "_id",
				as: "user"
			}
		},
		{
			"$unwind": {
				path: "$user",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			"$sort": {
				createdAt: -1
			}
		}
	])
		.exec()
		.then(result => messages = result)
		.catch(error_ => error = error_);

	console.log(messages);

	return {body: messages, error};
}

module.exports = {
	find, save, findAllRooms
}


