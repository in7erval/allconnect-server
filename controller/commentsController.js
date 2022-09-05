const commentsService = require("../service/commentsService");

const Logging = require('../logging/index');
const {emitter, COMMENTS_EVENT_NAME} = require("../emitter");
const console = new Logging(__filename);

class CommentsController {

	async getAll(req, res, next) {
		try {
			const commentsData = await commentsService.getAll(req.query);
			return res.json(commentsData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getOne(req, res, next) {
		try {
			emitter.once(COMMENTS_EVENT_NAME, (comment) => {
				res.json(comment);
			})
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getById(req, res, next) {
		try {
			const commentData = await commentsService.getById(req.params.id, req.query);
			return res.json(commentData);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async addComment(req, res, next) {
		try {
			const resData = await commentsService.addComment(req.body);
			emitter.emit(COMMENTS_EVENT_NAME, resData);
			return res.status(200);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

}

module.exports = new CommentsController();