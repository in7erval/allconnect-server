// "хранилище" пользователей
const Message = require("../../models/message");
const onError = require("../../utils/onError");
const users = [];

const getUser = (userId, socket) => {
	for (let user of users) {
		if (user.userId === userId) {
			return user;
		}
	}
	let newUser = {
		userId: userId,
		socketId: socket.id,
		connected: true,
		lastConnection: new Date()
	};
	users.push(newUser);
	return newUser;
}

function registerUserHandlers(io, socket) {

	const {userId} = socket;

	let user = getUser(userId, socket);
	user.connected = true;
	console.log("newOnlineUser", user);

	const updateUserList = () => {
		console.log("users_list:update => ");
		for (let user of users) {
			if (user.connected) {
				io.to(user.userId).emit('users_list:update', users);
			}
		}
	}

	socket.on('users:get', async () => {
		console.log("=> users.get")
		try {
			updateUserList();
		} catch (e) {
			onError(e);
		}
	});

	socket.on('disconnect', () => {
		if (!users) return
		socket.to(userId).emit('log', `User ${userId} disconnected`)

		let user = users.find((u) => u.userId === userId);
		user.connected = false;
		user.lastConnection = new Date();

		updateUserList();
	})
}


module.exports = registerUserHandlers;