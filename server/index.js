const express = require("express");
const bodyParser = require('body-parser');

const mongoApi = require("./mongo");
const mongoComments = require("./mongoComments");
const mongoUsers = require("./mongoUsers");
const mongoAuth = require("./mongoAuth");

const PORT = process.env.PORT || 3001;
const app = express();
const jsonParser = bodyParser.json();

const DB = mongoApi.getDB();


const urlToCollection = [
	{url: "/api/users", collection: mongoApi.USERS_COLLECTION},
	{url: "/api/comments", collection: mongoApi.COMMENTS_COLLECTION},
	{url: "/api/posts", collection: mongoApi.POSTS_COLLECTION},
	{url: "/api/usersFull", collection: mongoApi.USERS_FULL_COLLECTION}];

for (let el of urlToCollection) {

	app.get(el.url, (req, res) => {
		console.log(req.query);
		DB.then(DB => mongoApi.getAll(DB, el.collection, req.query))
			.then(answ => res.json({body: answ[0], total: answ[1]}))
	});

	app.get(`${el.url}/:id`, (req, res) => {
		console.log(req.params);
		DB.then(DB => mongoApi.getById(DB, el.collection, req.params.id))
			.then(user => res.json(user))
	});

}

app.get("/api/posts/:id/comments", (req, res) => {
	console.log(req.params);
	DB.then(DB => mongoComments.getByPostId(DB, mongoApi.COMMENTS_COLLECTION, req.params.id))
		.then(comms => res.json(comms))
});

app.get("/api/users/:id/comments", (req, res) => {
	console.log(req.params, req.query);
	let isToCount = req.query && req.query.count !== undefined;

	DB.then(DB => mongoUsers.getUserComments(DB, req.params.id, isToCount))
		.then(comms => res.json(comms))
});

app.get("/api/users/:id/posts", (req, res) => {
	console.log(req.params, req.query);
	let isToCount = req.query && req.query.count !== undefined;

	DB.then(DB => mongoUsers.getUserPosts(DB, req.params.id, isToCount))
		.then(posts => res.json(posts))
});

app.post("/api/auth", jsonParser, (req, res) => {
	console.log('/api/auth body=', req.body);

	DB.then(DB => mongoAuth.getAndCheckUser(DB, req.body.login, req.body.loginPass))
		.then(result => res.json(result));
})


app.listen(PORT, () => {
	console.log(`server listening on ${PORT}`);
})


