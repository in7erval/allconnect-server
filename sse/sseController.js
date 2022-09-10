const messagesService = require("../service/messagesService");

const Logging = require('../logging/index');
const {emitter, COMMENTS_EVENT_NAME} = require("../emitter");
const {response} = require("express");
const console = new Logging(__filename);

let clients = [];

class SseController {

	async register(req, res, next) {
		try {
			console.log("register", req.query);
			if (req.query.userId === undefined) {
				next();
				return;
			}
			const headers = {
				'Content-Type': 'text/event-stream',
				'Connection': 'keep-alive',
				'Cache-Control': 'no-cache'
			};
			res.writeHead(200, headers);
			const userId = req.query.userId.toString();

			const roomsData = await messagesService.findAllRooms(userId)
			const data = `data: ${JSON.stringify(roomsData)}\n\n`;
			response.write(data);

			const newClient = {
				id: userId,
				res
			};
			clients.push(newClient);

			req.on('close', () => {
				console.log(`${userId} Connection closed`);
				clients = clients.filter(client => client.id !== clientId);
			});
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

	async getOne(req, res, next) {
		try {
			console.debug(`subscribe for ${req.query.postId.toString()}`);
			emitter.once(COMMENTS_EVENT_NAME + req.query.postId.toString(), (comment) => {
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
			const postId = req.body.postId.toString();
			emitter.emit(COMMENTS_EVENT_NAME + postId, resData);
			return res.status(200);
		} catch (e) {
			console.error(e);
			next(e);
		}
	}

}

module.exports = new SseController();