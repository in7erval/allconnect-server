const TeleToken = require('../models/teleToken');

const Logging = require('../logging/index');
const console = new Logging(__filename);


class TelegramTokenService {

	async getToken(userId) {
		const token = await TeleToken.findOne({user: userId});
		console.log("get teleToken", token);
		return token;
	}

	async generateToken(userId) {
		let token = await TeleToken.findOne({user: userId}).select({_id: 1}).lean();
		console.log("get teleToken", token);

		if (!!token) {
			return token;
		}
		return TeleToken.create(
			{user: userId}
		);
	}

	async updateToken(userId) {
		await TeleToken.deleteMany({user: userId});
		console.log("updateToken teleToken, userId=", userId);

		return TeleToken.create(
			{user: userId}
		);
	}

}

module.exports = new TelegramTokenService();