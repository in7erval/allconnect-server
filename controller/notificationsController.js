const notificationsService = require("../service/notificationsService");

const Logging = require('../logging/index');
const {emitter, NOTIFICATIONS_EVENT_NAME} = require("../emitter");
const console = new Logging(__filename);

class NotificationsController {

	async getAllById(req, res, next) {
		try {
			const notificationsData = await notificationsService.getAllById(req.query);
			return res.json(notificationsData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getOne(req, res, next) {
		try {
			const forUser = req.query.id.toString();
			console.debug("SUBSCRIBE ", forUser);
			emitter.once(NOTIFICATIONS_EVENT_NAME + forUser,
				notification => {
					res.json(notification);
				}
			);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}
}

module.exports = new NotificationsController();