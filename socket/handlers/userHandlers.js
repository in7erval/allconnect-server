// "хранилище" пользователей
const UsersStatus = require('../../models/userStatus');
const onError = require("../onError");
const {ONLINE_USERS} = require("../constants");
const users = [];

const getUser = (userId) => {
	for (let user of users) {
		if (user.userId === userId) {
			return user;
		}
	}
	return null;
}

async function retrieveUsersStatusFromDB() {
	const _users = await UsersStatus.find().exec();
	console.log("firstRetrieve of _users", _users.length);
	users.length = 0;
	users.push(..._users.map(user => {
		return {
			userId: user.user.toString(),
			socketId: user.socketId,
			connected: user.connected,
			lastConnection: user.lastConnection
		};
	}));
	console.log("retrieved and set", users.length);
}

async function registerUserHandlers(io, socket) {

	const updateUserList = () => {
		console.log("users_list:update => ");
		io.to(ONLINE_USERS).emit('users_list:update', users);
	}

	const {userId} = socket;
	if (users.length === 0) {
		await retrieveUsersStatusFromDB();
	}

	let user = getUser(userId);
	if (user === null) {
		console.log("register newUserStatus");
		if (userId && socket.id) {
			user = await UsersStatus.create({
				user: userId,
				socketId: socket.id,
				connected: true
			}).catch(err => console.error(err));
		}
	} else {
		await UsersStatus.findOneAndUpdate(
			{"user": user.userId},
			{connected: true},
			{safe: true, new: true}
		).exec().catch(onError);
	}

	socket.on('users:get', async () => {
		console.log("=> users.get")
		try {
			await retrieveUsersStatusFromDB();
			updateUserList();
		} catch (e) {
			onError(e);
		}
	});

	socket.on('disconnect', async () => {
		if (!users || users.length === 0) return
		socket.to(ONLINE_USERS).emit('log', `User ${userId} disconnected`)

		await UsersStatus.findOneAndUpdate(
			{"user": user.userId},
			{lastConnection: new Date(), connected: false},
			{safe: true, new: true}
		).exec()
			.then(() => retrieveUsersStatusFromDB())
			.then(() => updateUserList())
			.catch(onError);

	});
}


module.exports = registerUserHandlers;