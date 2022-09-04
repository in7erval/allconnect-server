const Comment = require('../../models/comment');
const Post = require('../../models/post');
const onError = require('../onError');

const commentsService = require('../../service/commentsService');

const Logging = require("../../logging/index");
const {getAllById} = require("../../service/notificationsService");
const console = new Logging(__filename);

// "хранилище" для сообщений
const comments = {}

function registerCommentHandlers(io, socket) {
	// извлекаем идентификатор комнаты
	const {postId, userId} = socket;

	console.log("postId, userId", postId, userId);

	const updateCommentsList = () => {
		io.to(postId).emit('comment_list:update', comments[postId])
	};

	const getAllComments = async (postId) => {
		return Comment.find({post: postId}).populate('owner').exec();
	}

	socket.on('comments:get', async () => {
		try {
			comments[postId] = [...await getAllComments(postId)];
			updateCommentsList();
		} catch (e) {
			onError(e);
		}
	});


	// обрабатываем создание нового сообщения
	socket.on('comments:add', async (commentMsg) => {

		console.debug("new comment", commentMsg);

		const res = await commentsService.addComment({
			postId, userId, text: commentMsg
		});

		if (!comments[postId]) {
			comments[postId] = getAllComments(postId);
		}
		comments[postId].push(res.body);
		// обновляем список сообщений
		updateCommentsList();
	});

	// обрабатываем удаление сообщения
	socket.on('comments:remove', (commentId) => {
		// пользователи не должны ждать удаления сообщения из БД
		Comment.findByIdAndDelete(commentId).exec()
			.then(() => {
				console.log("comment removed");
			})
			.then(() => {
					console.log(comments[postId].length);
					console.log(comments[postId].map(el => el._id));
					console.log(commentId);
					comments[postId] = comments[postId].filter((m) => m._id.toString() !== commentId);
					console.log(comments[postId].length);
				}
			)
			.then(() => updateCommentsList())
			.catch(onError);
	})
}

module.exports = registerCommentHandlers;
