const postsService = require("../service/postsService");

const Logging = require('../logging/index');
const console = new Logging(__filename);

class PostsController {

	async getAll(req, res, next) {
		try {
			const postsData = await postsService.getAll(req.query);
			return res.json(postsData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getAllForUser(req, res, next) {
		try {
			const postsData = await postsService.getAllForOwner(req.params.id, req.query);
			return res.json(postsData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getById(req, res, next) {
		try {
			const postData = await postsService.getById(req.params.id, req.query);
			return res.json(postData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async addPost(req, res, next) {
		try {
			const resData = await postsService.addPost(req.body);
			return res.json(resData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async actionWithLike(req, res, next) {
		try {
			const resData = await postsService.actionWithLike(req.params.id, req.body.userId, req.query);
			return res.json(resData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async deleteById(req, res, next) {
		try {
			const resData = await postsService.deleteById(req.params.id);
			return res.json(resData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

}

module.exports = new PostsController();