const mongoose = require('mongoose');
const url = 'mongodb://0.0.0.0:27017/allconnect';
const {UUID} = require('bson');
const User = require('../models/user');
const Comment = require('../models/comment');
const Post = require('../models/post');
const UserAuth = require('../models/userAuth');
const comments = require('./comments.json');
const posts = require('./posts.json');
const users = require('./users.json');
const userAuths = require('./userAuth.json');

mongoose.connect(url);
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// for (let userAuth of userAuths) {
// 	const newUserAuth = new UserAuth({
// 		login: userAuth.login,
// 		loginPassBase64: userAuth.loginPassBase64,
// 		user: new mongoose.Types.ObjectId(userAuth.userId),
// 	});
//
// 	newUserAuth.save((err, inst) => {
// 		if (err) {
// 			console.error(err);
// 		} else {
// 			console.log(inst);
// 		}
// 	})
// }
//
UserAuth.findOne({login: 'aaaa'})
	.populate('user')
	.exec((err, inst) => {
		if (err) {
			console.error(err);
		} else {
			console.log(inst);
		}
	})


// for (let comment of comments) {
// 	const newComment = new Comment({
// 		_id: new mongoose.Types.ObjectId(comment.id),
// 		message: comment.message,
// 		owner: new mongoose.Types.ObjectId(comment.owner.id),
// 		post: new mongoose.Types.ObjectId(comment.post)
// 	});
// 	newComment.save((err, inst) => {
// 		if (err) {
// 			console.error(err);
// 		} else {
// 			console.log(inst);
// 		}
// 	});
// }

// Comment.findOne({})
// 	.populate({
// 		path: 'owner',
// 		populate: {
// 			path: 'friends'
// 		}
// 	})
// 	.populate('post')
// 	.exec((err, inst) => {
// 		if (err) {
// 			console.error(err);
// 		} else {
// 			console.log(inst);
// 		}
// 	});

// async function f() {
// 	for (let post of posts) {
//
// 		const promise = Comment
// 			.find({'post': new mongoose.Types.ObjectId(post.id)}, '_id')
// 			.exec();
// 		let foundComms = []
//
// 		await promise.then((comms, err) => {
// 			if (err) {
// 				console.log(err);
// 			} else {
// 				foundComms.push(...comms);
// 				console.log('COMMS', comms);
// 			}
// 		})
//
//
// 		const newPost = new Post({
// 			_id: new mongoose.Types.ObjectId(post.id),
// 			image: post.image,
// 			likes: post.likes,
// 			text: post.text,
// 			owner: new mongoose.Types.ObjectId(post.owner.id),
// 			comments: foundComms
// 		});
// 		newPost.save((err, inst) => {
// 			if (err) {
// 				console.error(err);
// 			} else {
// 				console.log(inst);
// 			}
// 		});
// 	}
// }

// f()

// Post.findOne({})
// 	.populate({
// 		path: 'owner',
// 		populate: {
// 			path: 'friends'
// 		}
// 	})
// 	.exec((err, inst) => {
// 		if (err) {
// 			console.error(err);
// 		} else {
// 			console.log(inst);
// 		}
// 	})


// for (let user of users) {
// 	const newUser = new User({
// 		_id: new mongoose.Types.ObjectId(user.id ? user.id : ""),
// 		firstName: user.firstName,
// 		lastName: user.lastName,
// 		friends: user.friends.map(el => new mongoose.Types.ObjectId(el)),
// 		picture: user.picture,
// 		email: user.email,
// 		gender: user.gender,
// 		dateOfBirth: user.dateOfBirth
// 	});
// 	newUser.save((err, inst) => {
// 		if (err) {
// 			console.error(err);
// 		} else {
// 			console.log(inst);
// 		}
// 	});
// }
//
// User.findOne({})
// 	// .populate('friends')
// 	.exec((err, comment) => {
// 		if (err) {
// 			console.error(err);
// 		} else {
// 			console.log(comment);
// 		}
// 	});

// Comment.findOne({})
// 	.populate('post')
// 	.exec((err, comment) => {
// 		if (err) {
// 			console.error(err);
// 		} else {
// 			console.log(comment);
// 		}
// 	});


// User.findOne({firstName: 'Adina'}, (er, user) => {
// 	if (er) {
// 		console.log(er);
// 	} else {
// 		console.log(user);
// 		console.log(user.registerDate);
// 		console.log(user.fullName);
// 	}
// });

// User.create({firstName: 'a', lastName: 'b'}, (er, inst) => {
// 	if (er) {
// 		console.log(er.toString());
// 	} else {
// 		console.log(inst);
// 	}
// });


// var schema = new Schema(
// 	{
// 		name: String,
// 		binary: Buffer,
// 		living: Boolean,
// 		updated: {type: Date, default: Date.now},
// 		age: {type: Number, min: 18, max: 65, required: true},
// 		mixed: Schema.Types.Mixed,
// 		_someId: Schema.Types.ObjectId,
// 		array: [],
// 		ofString: [String], // You can also have an array of each of the other types too.
// 		nested: {stuff: {type: String, lowercase: true, trim: true}}
// 	})

// let inst = new User({name: 'awesome'});
// inst.save(err => console.log(err));

// User.create({firstName: 'loh', lastName: 'loh'}, (err, inst) => {
// 	if (err) {
// 		console.log(err.toString());
// 	}
// 	console.log(inst);
// });

// User.findOne({firstName: 'loh'}, (err, users) => {
// 	if (err) {
// 		console.log(err.toString());
// 	}
// 	console.log(users);
// })
//
// User.find().where('title').equals('ms')
// .limit(5)
// .select('firstName lastName')
// .exec((err, users) => {
// 	if (err) {
// 		console.log(err.toString());
// 	}
// 	console.log(users);
// });
