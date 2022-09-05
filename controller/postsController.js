const mongoPosts = require("../service/postsService");

const Logging = require('../logging/index');
const console = new Logging(__filename);

class PostsController {

	async getAll(req, res, next) {
		try {
			const postsData = await mongoPosts.getAll(req.query);
			return res.json(postsData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getAllForUser(req, res, next) {
		try {
			const postsData = await mongoPosts.getAllForOwner(req.params.id, req.query);
			return res.json(postsData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getById(req, res, next) {
		try {
			const postData = await mongoPosts.getById(req.params.id, req.query);
			return res.json(postData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async addPost(req, res, next) {
		try {
			const resData = await mongoPosts.addPost(req.body);
			return res.json(resData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async actionWithLike(req, res, next) {
		try {
			const resData = await mongoPosts.actionWithLike(req.params.id, req.body.userId, req.query);
			return res.json(resData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

}

module.exports = new PostsController();