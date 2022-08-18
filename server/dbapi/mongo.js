const mongoose = require('mongoose');
require('dotenv/config');
// or as an es module:
// import { MongoClient } from 'mongodb'
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true},
	err => {
		console.log('connected')
	});

mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function isQueryValid(query) {
	if (query.page !== undefined && +query.page <= 0) {
		return false;
	}
	return !(query.limit !== undefined && +query.limit <= 0);
}

function parseQuery(query) {
	if (!isQueryValid(query)) {
		console.log("query in not valid: ", query);
		return {limit: null, skipCount: null};
	}

	let limit = 10, skipCount = 0;

	let page = query.page === undefined ? 1 : +query.page;
	limit = query.limit === undefined ? 10 : +query.limit;
	skipCount = (page - 1) * limit;
	if (query.all !== undefined) {
		limit = Infinity;
		skipCount = 0;
	}
	return {limit, skipCount};
}

async function getAll(db, collectionName, query) {
	const collection = db.collection(collectionName);
	let answ, skipCount = 0, limit = 10;

	if (isQueryValid(query)) {
		let page = query.page === undefined ? 1 : +query.page;
		limit = query.limit === undefined ? 10 : +query.limit;
		skipCount = (page - 1) * limit;
		if (query.all !== undefined) {
			limit = Infinity;
			skipCount = 0;
		}
	} else {
		console.log("query in not valid: ", query);
	}

	// пока только для постов, подумать как сделать лучше
	if (query.userId) {
		return getAllForUser(db, collectionName, skipCount, limit, query.userId);
	}

	answ = await collection.find({});
	if (!(collectionName in EXCLUDES_FOR_SORTING)) {
		answ = answ.sort({'publishDate': -1});
	}
	answ = answ.skip(skipCount).limit(limit);

	return [await answ.toArray(),
		await collection.countDocuments()];
}

async function getAllForUser(db, collectionName, skipCount, limit, userId) {
	let user = await db.collection(USERS_COLLECTION).findOne({'id': userId});

	if (user.friends === null || user.friends === undefined) {
		user.friends = [];
	}

	let allPosts = (await db.collection(POSTS_COLLECTION).find({})
		.sort({'publishDate': -1})
		.toArray())
		.filter(el => {
			for (let friendId of user.friends) {
				if (el.owner.id === friendId) {
					return true;
				}
			}
			return false;
		});

	return [allPosts.slice(skipCount, skipCount + limit), allPosts.length];
}

async function getById(db, collectionName, id) {
	return await db.collection(collectionName)
		.findOne({"id": id});
}


exports.getAll = getAll;
exports.getById = getById;
exports.parseQuery = parseQuery;
