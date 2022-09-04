const messagesService = require("../service/messagesService");

const Logging = require('../logging/index');
const {emitter, UNREAD_MESSAGES_EVENT_NAME} = require("../emitter");
const console = new Logging(__filename);

class MessagesController {

	async getMessages(req, res, next) {
		try {
			const messagesData = await messagesService.find(req.query);
			return res.json(messagesData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async saveMessage(req, res, next) {
		try {
			const resData = await messagesService.save(req.body);
			return res.json(resData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async findAllRooms(req, res, next) {
		try {
			const messages = await messagesService.findAllRooms(req.query.user);
			return res.json(messages);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getUnreadMessages(req, res, next) {
		try {
			const countData = await messagesService.getUnreadMessages(req.query.user);
			return res.json(countData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getUnreadMessagesSubscribe(req, res, next) {
		try {
			const userId = req.query.user;
			emitter.once(UNREAD_MESSAGES_EVENT_NAME + userId, (unreadMessages) => {
				res.json(unreadMessages);
			});
		} catch (e) {
			console.error(e);
			next(e);
		}
	}
}

module.exports = new MessagesController();