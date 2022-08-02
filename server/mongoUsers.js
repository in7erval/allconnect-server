let mongo = require('./mongo');

async function getUserComments(db, id, isToCount) {
	let result = await db.collection(mongo.COMMENTS_COLLECTION)
		.find({"owner.id": id}).toArray();
	let body = {};

	if (!isToCount) body = result;

	return {'body': body, 'count': result.length};
}

async function getUserPosts(db, id, isToCount) {
	let result = await db.collection(mongo.POSTS_COLLECTION)
		.find({"owner.id": id}).toArray();
	let body = {};

	if (!isToCount) body = result;

	return {'body': body, 'count': result.length};
}

exports.getUserComments = getUserComments;
exports.getUserPosts = getUserPosts;

