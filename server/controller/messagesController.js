const messagesService = require("../service/messagesService");

const Logging = require('../logging/index');
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

	async countUnreadMessages(req, res, next) {
		try {
			const countData = await messagesService.countUnreadMessages(req.query.user);
			return res.json(countData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}
}

module.exports = new MessagesController();