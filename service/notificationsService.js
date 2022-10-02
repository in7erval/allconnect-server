const Notification = require('../models/notification');
const TeleToken = require('../models/teleToken');
const {parseQuery} = require("./utils");
const Logging = require("../logging");
const {mongoose} = require("mongoose");
const ApiError = require("../exceptions/apiError");
const {emitter, NOTIFICATIONS_EVENT_NAME} = require("../emitter");
const axios = require("axios");

require('dotenv/config');

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
	if (commenterUserId.toString() !== ownerPostId.toString()) {
		return createNotification(postId, commenterUserId, "COMMENT", ownerPostId);
	}
}

function addNotificationForLike(postId, likerUserId, ownerPostId) {
	if (likerUserId.toString() !== ownerPostId.toString()) {
		return createNotification(postId, likerUserId, "LIKE", ownerPostId);
	}
}

async function createNotification(postId, fromUserId, type, ownerPostId) {
	let answ = await Notification.create({
		type: type.toString(),
		forUser: ownerPostId.toString(),
		additionalInfo: {
			post: postId.toString(),
			user: fromUserId.toString()
		}
	})
		.catch(error => {
			console.error('error when creating notification', error.toString());
			throw ApiError.BadRequest(`Ошибка при создании уведомления, параметры(postId=${postId}, ` +
				`fromUserId=${fromUserId}, type=${type}, ownerPostId=${ownerPostId}), error=${error}`);
		});

	answ = await answ.populate({path: 'additionalInfo', populate: {path: 'post'}});
	answ = await answ.populate({path: 'additionalInfo', populate: {path: 'user'}});
	console.debug("Create notification", answ);

	emitter.emit(NOTIFICATIONS_EVENT_NAME + ownerPostId.toString(), answ);

	const token = await TeleToken.findOne({user: ownerPostId.toString()});
	console.debug("Check token", token);
	if (!!token) {
		const telegramUser = token.telegramUser;
		if (telegramUser) {
			let message;
			let postMessage;
			if (answ.additionalInfo.post.text?.length > 50) {
				postMessage = answ.additionalInfo.post.text.substring(0, 47) + "...";
			} else {
				postMessage = answ.additionalInfo.post.text;
			}
			if (type === 'LIKE') {
				message = `Лайк от пользователя ${answ.additionalInfo.user.firstName} ${answ.additionalInfo.user.lastName} к записи '${postMessage}'`
			} else if (type === 'COMMENT') {
				message = `Комментарий от пользователя ${answ.additionalInfo.user.firstName} ${answ.additionalInfo.user.lastName} к записи '${postMessage}'`
			}
			await axios.get(`https://api.telegram.org/bot${process.env.TELEBOT_TOKEN}/sendMessage`,
				{
					params: {
						text: message,
						chat_id: telegramUser
					}
				})
		}
	}


	return {body: answ};
}


module.exports = {
	getAllById,
	addNotificationForComment,
	addNotificationForLike
}

