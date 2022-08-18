const socketio = require('socket.io');


function initSocket(server) {

	const io = new socketio.Server(server, {
		cors: {
			origin: '*' //fixme on host 'http://localhost:3000"
		}
	});

// получаем обработчики событий
	const registerMessageHandlers = require('./handlers/messageHandlers');
	const registerUserHandlers = require('./handlers/userHandlers');
	const registerCommentHandlers = require('./handlers/commentHandlers');

// данная функция выполняется при подключении каждого сокета (обычно, один клиент = один сокет)
	const onConnection = (io, socket) => {
		console.log('User connected');

		const {roomId, userName, postId, userId} = socket.handshake.query;

		socket.roomId = roomId;
		socket.userName = userName;
		socket.postId = postId;
		socket.userId = userId;

		if (roomId) {
			socket.join(roomId);
		} else {
			socket.join(postId);
		}

		registerMessageHandlers(io, socket);
		registerUserHandlers(io, socket);
		registerCommentHandlers(io, socket);

		// обрабатываем отключение сокета-пользователя
		socket.on('disconnect', () => {
			// выводим сообщение
			console.log('User disconnected')
			// покидаем комнату
			if (roomId) {
				socket.leave(roomId);
			} else {
				socket.leave(postId);
			}
		})
	}

// обрабатываем подключение
	io.on('connection', (socket) => {
		onConnection(io, socket)
	});
}

module.exports = {initSocket}