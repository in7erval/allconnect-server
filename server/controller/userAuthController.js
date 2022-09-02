const userService = require('../service/userAuthService');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/apiError');

const Logging = require('../logging/index');
const console = new Logging(__filename);

class UserAuthController {

	async registration(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
			}
			const {email, password, firstName, lastName} = req.body;
			const userData = await userService.registration(email, password, firstName, lastName);
			res.cookie('refreshToken', userData.refreshToken, {httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000});

			return res.json(userData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async login(req, res, next) {
		try {
			const {email, password} = req.body;
			const userData = await userService.login(email, password);
			res.cookie('refreshToken', userData.refreshToken, {httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000});

			return res.json(userData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async logout(req, res, next) {
		try {
				const {refreshToken} = req.cookies;
				const token = await userService.logout(refreshToken);

				res.clearCookie('refreshToken');
				return res.json(token);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	// async activate(req, res, next) {
	// 	try {
	// 		const activationLink = req.params.link;
	// 		await userService.activate(activationLink);
	// 		return res.redirect(process.env.CLIENT_URL);
	// 	} catch (e) {
	// 		console.error(e);
	// 		next(e);
	// 	}
	// }

	async refresh(req, res, next) {
		try {
			const {refreshToken} = req.cookies;
			const userData = await userService.refresh(refreshToken);
			res.cookie('refreshToken', userData.refreshToken, {httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000});

			return res.json(userData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}
}

module.exports = new UserAuthController();