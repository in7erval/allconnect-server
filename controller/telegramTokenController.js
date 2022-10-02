const telegramTokenService = require('../service/telegramTokenService');

const Logging = require('../logging/index');
const console = new Logging(__filename);

class TelegramTokenController {

	async getToken(req, res, next) {
		try {
			console.log(req.query);
			const userId = req.query.userId;
			const token = await telegramTokenService.getToken(userId);
			return res.json({token: token?._id, user: token?.user, telegramUser: token?.telegramUser});
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async generateToken(req, res, next) {
		try {
			console.log(req.query);
			const userId = req.query.userId;
			const token = await telegramTokenService.generateToken(userId);
			return res.json({token: token._id, ...token});
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async updateToken(req, res, next) {
		try {
			console.log(req.query);
			const userId = req.query.userId;
			const token = await telegramTokenService.updateToken(userId);
			return res.json({token: token._id, ...token});
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

}

module.exports = new TelegramTokenController();