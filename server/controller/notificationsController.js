const mongoNotifications = require("../service/notificationsService");

const Logging = require('../logging/index');
const console = new Logging(__filename);

class NotificationsController {

	async getAllById(req, res, next) {
		try {
			const notificationsData = await mongoNotifications.getAllById(req.query);
			return res.json(notificationsData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}
}

module.exports = new NotificationsController();