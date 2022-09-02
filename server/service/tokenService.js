const jwt = require('jsonwebtoken');
const Token = require('../models/token');

class TokenService {

	generateTokens(payload) {
		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '1d'});
		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});
		return {accessToken, refreshToken};
	}

	// todo: В базе по одному пользователю один токен => при входе с другого устройства,
	//  на предыдущем устр-ве токен станет невалидным и произойдет логаут
	async saveToken(userId, refreshToken) {
		const tokenData = await Token.findOne({user: userId});
		if (tokenData) {
			tokenData.refreshToken = refreshToken;
			return tokenData.save();
		}
		const token = await Token.create({user: userId, refreshToken});
		return token;
	}

	async removeToken(refreshToken) {
		const tokenData = await Token.deleteOne({refreshToken});
		return tokenData;
	}

	validateAccessToken(token) {
		try {
			const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
			return userData;
		} catch (e) {
			return null;
		}
	}

	validateRefreshToken(token) {
		try {
			const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
			return userData;
		} catch (e) {
			return null;
		}
 	}

	 async findToken(refreshToken) {
		 const tokenData = await Token.findOne({refreshToken});
		 return tokenData;
	 }

}

module.exports = new TokenService();