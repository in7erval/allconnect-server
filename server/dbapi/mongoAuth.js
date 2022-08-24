const mongo = require('./mongo');
const UserAuth = require('../models/userAuth');
const User = require('../models/user');


const mongoUsers = require('./mongoUsers');
const {
	MULTIPLE_LOGINS,
	NOT_FOUND,
	PASSWORD_NOT_CORRECT,
	ALREADY_REGISTERED,
	NOT_ACKNOWLEDGED
} = require('../errors/authErrors');
const mongoose = require("mongoose");

async function getUserByUid(uid) {
	let user = {};
	let error = null;

	await UserAuth.findOne({"uid": uid.toString()})
		// .populate('user')
		.exec()
		.then(userResponse => user = userResponse)
		.catch(errorResponse => error = errorResponse);
	return {user, error};
}

async function getUser(email) {
	let user = {};
	let error = null;

	const promise = UserAuth.findOne({"email": email.toString()})
		// .populate('user')
		.exec();

	await promise.then((userAuth, err) => {
		if (err) {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		} else {
			console.log("found", userAuth);
			user = userAuth;
		}
	});

	if (user === null) {
		return {body: null, error: NOT_FOUND};
	}

	return {body: user, error: error};
}

async function registerUser(user) {
	let answ = {};
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

	await newUserAuth.save()
		.then(inst => {
			console.log("newUSERAUTH", inst);
			newUser._id = inst.user;
			return newUser.save();
		})
		.then(instUser => {
			console.log("USER", instUser);
			answ = instUser;
		})
		.catch(err => {
			console.log('error', err.toString());
			error = {msg: err.toString(), code: -1};
		});

	return {body: answ, error};
}

module.exports = {
	getUser,
	registerUser,
	getUserByUid
}


