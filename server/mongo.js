const {MongoClient} = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb'

const url = 'mongodb://0.0.0.0:27017';
const USERS_COLLECTION = "users";
const COMMENTS_COLLECTION = "comments";
const POSTS_COLLECTION = "posts";
const USERS_FULL_COLLECTION = "usersFull";
const USER_AUTH_COLLECTION = "userAuth";

const EXCLUDES_FOR_SORTING = [USERS_COLLECTION, USERS_FULL_COLLECTION];

async function getDB(dbName = 'allconnect') {
	const client = new MongoClient(url);
	return await client.connect()
		.then(client => client.db(dbName));
}

function isQueryValid(query) {
	if (query.page !== undefined && +query.page <= 0) {
		return false;
	}
	return !(query.limit !== undefined && +query.limit <= 0);
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

	answ = await collection.find({});
	if (!(collectionName in EXCLUDES_FOR_SORTING)) {
		answ = answ.sort({'publishDate': -1});
	}
	answ = answ.skip(skipCount).limit(limit);

	return [await answ.toArray(),
		await collection.countDocuments()];
}

async function getById(db, collectionName, id) {
	return await db.collection(collectionName)
		.findOne({"_id": id});
}


exports.getDB = getDB;
exports.getAll = getAll;
exports.getById = getById;
exports.USERS_COLLECTION = USERS_COLLECTION;
exports.COMMENTS_COLLECTION = COMMENTS_COLLECTION;
exports.POSTS_COLLECTION = POSTS_COLLECTION;
exports.USERS_FULL_COLLECTION = USERS_FULL_COLLECTION;
exports.USER_AUTH_COLLECTION = USER_AUTH_COLLECTION;

// main()
// 	.then(console.log)
// 	.catch(console.error)
// 	.finally(() => client.close());