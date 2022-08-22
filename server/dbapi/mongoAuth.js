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

async function getUser(login, loginPass) {
	let user = {};
	let error = null;

	const promise = UserAuth.findOne({"login": login.toString()})
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

	if (user.loginPassBase64 !== loginPass) {
		return {body: null, error: PASSWORD_NOT_CORRECT};
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
		login: user.login,
		loginPassBase64: user.loginPass,
		user: newUser._id
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
	registerUser
}


