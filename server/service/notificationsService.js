const Notification = require('../models/notification');
const {parseQuery} = require("./utils");
const Logging = require("../logging");
const {mongoose} = require("mongoose");
const ApiError = require("../exceptions/apiError");

const console = new Logging(__filename);

async function getAllById(query) {
	const {limit, skipCount} = parseQuery(query);
	const userId = query.userId

	if (userId === undefined || userId === null) {
		throw ApiError.BadRequest(`Не заполнен параметр userId для получения уведомлений, query=${query}`);
	}

	const answer = await Notification.aggregate([
		{
			'$match': {
				'forUser': new mongoose.Types.ObjectId(userId)
			}
		},
		{
			'$sort': {
				'createdAt': -1
			}
		},
		{
			'$skip': skipCount
		},
		{
			'$limit': limit
		},
		{
			'$addFields': {
				'additionalInfo.user': {
					'$toObjectId': '$additionalInfo.user'
				},
				'additionalInfo.post': {
					'$toObjectId': '$additionalInfo.post'
				}
			}
		},
		{
			'$lookup': {
				'from': 'users',
				'localField': 'additionalInfo.user',
				'foreignField': '_id',
				'as': 'additionalInfo.user'
			}
		},
		{
			'$lookup': {
				'from': 'posts',
				'localField': 'additionalInfo.post',
				'foreignField': '_id',
				'as': 'additionalInfo.post'
			}
		},
		{
			'$unwind': {
				'path': '$additionalInfo.user',
				'preserveNullAndEmptyArrays': true
			}
		},
		{
			'$unwind': {
				'path': '$additionalInfo.post',
				'preserveNullAndEmptyArrays': true
			}
		}
	])
		.exec()
		.catch(error => {
			console.error(error);
			throw ApiError.BadRequest(`Ошибка при получении уведомлений, query=${query}, error=${error}`);
		});
	console.debug("found", answer.length);

	return {body: answer, count: await Notification.countDocuments()};
}

function addNotificationForComment(postId, commenterUserId, ownerPostId) {
	return createNotification(postId, commenterUserId, "COMMENT", ownerPostId);
}

function addNotificationForLike(postId, likerUserId, ownerPostId) {
	return createNotification(postId, likerUserId, "LIKE", ownerPostId);
}

async function createNotification(postId, fromUserId, type, ownerPostId) {
	let answ = {};

	await Notification.create({
		type: type.toString(),
		forUser: ownerPostId.toString(),
		additionalInfo: {
			post: postId.toString(),
			user: fromUserId.toString()
		}
	})
		.then((doc) => console.debug("Create notification", doc))
		.catch(error => {
			console.error('error when creating notification', error.toString());
			throw ApiError.BadRequest(`Ошибка при создании уведомления, параметры(postId=${postId}, ` +
				`fromUserId=${fromUserId}, type=${type}, ownerPostId=${ownerPostId}), error=${error}`);
		});

	return {body: answ};
}


module.exports = {
	getAllById,
	addNotificationForComment,
	addNotificationForLike
}

