const Message = require('../../models/message');
const onError = require('../onError');
const messageService = require("../../service/messagesService");

const Logging = require("../../logging/index");
const console = new Logging(__filename);

// "хранилище" для сообщений
const messageRooms = {}

function registerMessageRoomsHandlers(io, socket) {
	const {userId} = socket;

	const updateMessageRoomsList = () => {
		console.log("updateMessageList");
		io.to("roomsFor" + userId).emit('message_list:update', messageRooms[userId]);
	};
	// обрабатываем получение сообщений
	socket.on('message_rooms:get', async () => {
		try {
			// получаем сообщения по `id` комнаты
			const _rooms = await messageService.findAllRooms(userId);
			console.log("_rooms", _rooms.length);
			// инициализируем хранилище сообщений
			messageRooms[userId] = _rooms
			// обновляем список сообщений
			updateMessageRoomsList();
		} catch (e) {
			onError(e);
		}
	});

	// // обрабатываем создание нового сообщения
	// socket.on('message_room:add', async (message) => {
	//
	// 	console.log("INPUT MESSAGE", message);
	// 	// пользователи не должны ждать записи сообщения в БД
	//
	// 	message = await messageService.save(message);
	//
	// 	// это нужно для клиента
	// 	message.createdAt = Date.now();
	//
	// 	if (!messages[roomId] || messages[roomId].length === 0) {
	// 		const _messages = await Message.find({roomId})
	// 			.populate('user').exec();
	// 		console.log("_messages", _messages);
	// 		// инициализируем хранилище сообщений
	// 		messages[roomId] = _messages
	// 	}
	// 	messages[roomId].push(message);
	//
	// 	// обновляем список сообщений
	// 	updateMessageList()
	// });

}

module.exports = registerMessageRoomsHandlers;
