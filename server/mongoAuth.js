const mongo = require('./mongo');
const {
	MULTIPLE_LOGINS,
	NOT_FOUND,
	PASSWORD_NOT_CORRECT
} = require('./errors/authErrors');

async function getAndCheckUser(db, login, loginPass) {
	let logins = await db.collection(mongo.USER_AUTH_COLLECTION)
		.find({"login": login}).toArray();

	if (logins.length > 1) {
		console.warn("Found multiple logins: ", logins);
		return {user: null, error: MULTIPLE_LOGINS};
	} else if (logins.length === 0) {
		return {user: null, error: NOT_FOUND};
	}

	let user = logins[0];
	if (user.loginPassBase64 !== loginPass) {
		return {user: null, error: PASSWORD_NOT_CORRECT};
	}

	return {user: user, error: null};
}

exports.getAndCheckUser = getAndCheckUser;

