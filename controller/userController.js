const userService = require("../service/userService");

const Logging = require('../logging/index');
const ApiError = require("../exceptions/apiError");
const console = new Logging(__filename);

class UserController {

	async getUsers(req, res, next) {
		try {
			const usersData = await userService.getAll(req.query);
			return res.json(usersData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getUserById(req, res, next) {
		try {
			const user = await userService.getById(req.params.id, req.query);
			return res.json(user);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getUserByName(req, res, next) {
		try {
			const user = await userService.getUserByName(req.query);
			return res.json(user);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async addFriend(req, res, next) {
		try {
			const resData = await userService.addFriend(req.query);
			return res.json(resData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async deleteFriend(req, res, next) {
		try {
			const resData = await userService.deleteFriend(req.query);
			return res.json(resData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async update(req, res, next) {
		try {
			const resData = await userService.updateOne(req.body);
			return res.json(resData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async updatePhoto(req, res, next) {
		try {
			if (req.file == undefined) {
				throw ApiError.BadRequest("Файл отсутствует или не был загружен");
			}
			const url = req.protocol + "://" + req.get('host');
			const fullurl = url + '/uploads/' + req.params.id + "/" + req.file.filename;
			console.info("URL", fullurl);
			await userService.updateOne({ userId: req.params.id, picture: fullurl });

			return res.json({
				message: "The following file was uploaded successfully: " + req.file.originalname
			})
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

}

module.exports = new UserController();