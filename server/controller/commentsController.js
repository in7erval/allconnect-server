const mongoComments = require("../service/commentsService");

const Logging = require('../logging/index');
const console = new Logging(__filename);

class CommentsController {

	async getAll(req, res, next) {
		try {
			const commentsData = await mongoComments.getAll(req.query);
			return res.json(commentsData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getById(req, res, next) {
		try {
			const commentData = await mongoComments.getById(req.params,id, req.query);
			return res.json(commentData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async addComment(req, res, next) {
		try {
			const resData = await mongoComments.addComment(req.body);
			return res.json(resData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

}

module.exports = new CommentsController();