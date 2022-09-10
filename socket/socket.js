const socketio = require('socket.io');
const {ONLINE_USERS} = require("./constants");
require('dotenv/config');

const Logging = require("../logging/index");
const console = new Logging(__filename);

function initSocket(server) {

	const io = new socketio.Server(server, {
		cors: {
			origin: process.env.CLIENT_URL
		}
	});

// получаем обработчики событий
	const registerMessageHandlers = require('./handlers/messageHandlers');
	const registerUserHandlers = require('./handlers/userHandlers');
	const registerCommentHandlers = require('./handlers/commentHandlers');

// данная функция выполняется при подключении каждого сокета (обычно, один клиент = один сокет)
	const onConnection = async (io, socket) => {
		const {roomId, postId, userId, action} = socket.handshake.query;

		socket.roomId = roomId;
		socket.postId = postId;
		socket.userId = userId;
		socket.action = action;


		// registerUserHandlers(io, socket);

		switch (action) {
			case "message":
				console.log(`User ${userId} connected to (roomId:${roomId})`);
				socket.join(roomId);
				registerMessageHandlers(io, socket);
				break;
			case "comment":
				console.log(`User ${userId} connected to (postId:${postId})`);
				socket.join(postId);
				registerCommentHandlers(io, socket);
				break
			case "connect":
				console.log(`User ${userId} connected`);
				socket.join(ONLINE_USERS);
				await registerUserHandlers(io, socket);
				break;
		}

		// обрабатываем отключение сокета-пользователя
		socket.on('disconnect', () => {
			// выводим сообщение
			console.log('User disconnected')
			// покидаем комнату
			switch (action) {
				case "message":
					socket.leave(roomId);
					break;
				case "comment":
					socket.leave(postId);
					break;
				case "connect":
					socket.leave(ONLINE_USERS);
					break;
			}
		})
	}

// обрабатываем подключение
	io.on('connection', async (socket) => {
		await onConnection(io, socket)
	});
}

module.exports = {initSocket}