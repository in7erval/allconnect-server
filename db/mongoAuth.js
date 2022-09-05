const UserAuth = require('../models/userAuth');
const User = require('../models/user');

const Logging = require("../logging/index");
const console = new Logging(__filename);
const ApiError = require("../exceptions/apiError");

async function getUserByUid(uid) {
	let error = null;

	const user = await UserAuth.findOne({"uid": uid.toString()})
		// .populate('user')
		.exec()
		.catch(errorResponse => {
			throw ApiError.BadRequest(`Не найден пользователь с uid=${uid}. ${errorResponse}`);
		});
	return {user, error};
}

async function getUser(email) {
	const user = await UserAuth.findOne({"email": email.toString()})
		.exec()
		.then(userAuth => {
			console.debug("found", userAuth);
			return userAuth;
		})
		.catch(_error => {
			console.error('error', _error.toString());
			throw ApiError.BadRequest(`Ошибка при авторизации: ${error}`);
		});

	if (user === null) {
		throw ApiError.BadRequest(`Пользователь с email ${email} не найден`);
	}

	return {body: user};
}

async function registerUser(user) {
	let error = null;

	const newUser = new User({
		firstName: user.firstName,
		lastName: user.lastName,
		friends: []
	})

	const newUserAuth = new UserAuth({
		email: user.email,
		user: newUser._id,
		uid: user.uid,
		metadata: user.metadata
	});

	const answ = await newUserAuth.save()
		.then(inst => {
			console.debug("newUSERAUTH", inst);
			newUser._id = inst.user;
			return newUser.save();
		})
		.then(instUser => {
			console.debug("USER", instUser);
			return instUser;
		})
		.catch(err => {
			console.error('error', err.toString());
			throw ApiError.BadRequest(`Ошибка при сохранении пользователя: ${err}`);
		});

	return {body: answ, error};
}

module.exports = {
	getUser,
	registerUser,
	getUserByUid
}


