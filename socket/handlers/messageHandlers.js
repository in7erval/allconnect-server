const Message = require('../../models/message');
const onError = require('../onError');
const messageService = require("../../service/messagesService");

const Logging = require("../../logging/index");
const console = new Logging(__filename);

// "хранилище" для сообщений
const messages = {}

function registerMessageHandlers(io, socket) {
	// извлекаем идентификатор комнаты
	const {roomId} = socket;

	// утилита для обновления списка сообщений
	const updateMessageList = () => {
		console.log("updateMessageList");
		io.to(roomId).emit('message_list:update', messages[roomId]);
	};
	// обрабатываем получение сообщений
	socket.on('message:get', async () => {
		try {
			// получаем сообщения по `id` комнаты
			const _messages = await Message.find({roomId})
				.populate('user').exec();
			console.log("_messages", _messages);
			// инициализируем хранилище сообщений
			messages[roomId] = _messages

			// обновляем список сообщений
			updateMessageList();
		} catch (e) {
			onError(e);
		}
	});

	// обрабатываем создание нового сообщения
	socket.on('message:add', async (message) => {

		console.log("INPUT MESSAGE", message);
		// пользователи не должны ждать записи сообщения в БД

		message = await messageService.save(message);

		// это нужно для клиента
		message.createdAt = Date.now();

		if (!messages[roomId] || messages[roomId].length === 0) {
			const _messages = await Message.find({roomId})
				.populate('user').exec();
			console.log("_messages", _messages);
			// инициализируем хранилище сообщений
			messages[roomId] = _messages
		}
		messages[roomId].push(message);

		// обновляем список сообщений
		updateMessageList()
	});

	// обрабатываем удаление сообщения
	socket.on('message:remove', (messageId) => {
		// пользователи не должны ждать удаления сообщения из БД
		Message.findByIdAndDelete(messageId).exec()
			.then(() => {
				console.log("message removed");
				// if (messageType !== 'text') {
				// 	removeFile(textOrPathToFile)
				// }
			})
			.then(() => {
					console.log(messages[roomId].length);
					console.log(messages[roomId].map(el => el._id));
					console.log(messageId);
					messages[roomId] = messages[roomId].filter((m) => m._id.toString() !== messageId);
					console.log(messages[roomId].length);
				}
			)
			.then(() => updateMessageList())
			.catch(onError);
	})

	socket.on('message:addToSeenBy', async (parameters) => {
		const {_id, user} = parameters;
		console.log("addToSeenBy", parameters);
		await messageService.addToSeenBy(_id, user)
			.then(async () => {
				messages[roomId] = await Message.find({roomId})
					.populate('user').exec();
			})
			.then(() => updateMessageList())
			.catch(onError);
	});

}

module.exports = registerMessageHandlers;
