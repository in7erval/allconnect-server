const Message = require('../models/message');
const ObjectId = require('mongodb').ObjectId;
const Logging = require("../logging");
const ApiError = require("../exceptions/apiError");

const console = new Logging(__filename);


async function find(query) {
	let promise = Message.find({roomId: query.roomId.toString()})
		.sort({createdAt: -1});

	if (query.last) {
		promise = promise.limit(1);
	}

	promise.populate('user');

	const answer = await promise.exec()
		.catch(error => {
			console.error('error', _error.toString());
			throw ApiError.BadRequest(`Ошибка при получении сообщений query=${query}. ${error}`);
		});

	return {body: answer}
}

async function save(message) {
	return Message.create({
		user: message.user.toString(),
		roomId: message.roomId.toString(),
		text: message.text.toString(),
		seenBy: [message.user.toString()]
	});
}

async function countUnreadMessages(userId) {
	userId = userId.toString();

	let result = await Message.aggregate([
		{
			$match: {
				roomId: {
					$regex: new RegExp(`(${userId}:\\w+)|(\\w+:${userId})`, 'g')
				},
				user: {
					$ne: new ObjectId(userId)
				},
				seenBy: {
					$ne: new ObjectId(userId)
				}
			}
		}
	]).exec()
		.catch(error => {
			console.error(error);
			throw ApiError.BadRequest(`Ошибка при подсчете непрочитанных сообщений для userId=${userId}. ${error}`);
		});

	console.info("unseen messages", result);

	return [...result];
}

async function findAllRooms(userId) {
	userId = userId.toString()

	let messages = await Message.aggregate([
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
		.catch(error => {
			console.error(error);
			throw ApiError.BadRequest(`Ошибка при получении чатов для пользователя с userId=${userId}. ${error}`);
		});

	console.info(messages);

	return messages;
}

module.exports = {
	find, save, findAllRooms, countUnreadMessages
}


