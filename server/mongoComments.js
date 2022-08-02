
async function getByPostId(db, collectionName, id) {
	return await db.collection(collectionName)
		.find({"post": id})
		.toArray();
}

exports.getByPostId = getByPostId;

