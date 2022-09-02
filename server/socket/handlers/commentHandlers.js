const Comment = require('../../models/comment');
const Post = require('../../models/post');
const onError = require('../onError');

const Logging = require("../../logging/index");
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

	socket.on('comments:get', async () => {
		try {
			const _comments = await Comment.find({post: postId})
				.populate('owner').exec();
			console.log("_comments", _comments);

			comments[postId] = _comments;


			updateCommentsList();
		} catch (e) {
			onError(e);
		}
	});


	// обрабатываем создание нового сообщения
	socket.on('comments:add', async (commentMsg) => {

		const post = await Post.findById(postId).exec();

		console.log("INPUT COMMENT", commentMsg);
		// пользователи не должны ждать записи сообщения в БД
		let comment = await Comment.create({
			message: commentMsg,
			owner: userId,
			post: postId
		}).catch(onError);
		post.comments.push(comment._id);
		await post.save();

		await comment.populate('owner');
		console.log("POPULATE", comment);

		// создаем сообщение оптимистически,
		// т.е. предполагая, что запись сообщения в БД будет успешной
		comments[postId].push(comment);

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
