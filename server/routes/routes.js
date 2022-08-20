const mongoUsers = require("../dbapi/mongoUsers");
const mongoComments = require("../dbapi/mongoComments");
const mongoPosts = require("../dbapi/mongoPosts");
const mongoAuth = require("../dbapi/mongoAuth");
const mongoMessages = require("../dbapi/mongoMessages");
const bodyParser = require("body-parser");

const jsonParser = bodyParser.json();

function createRoutes(app) {

	app.get("/api/users", (req, res) => {
		console.log("/api/users", req.query);
		mongoUsers.getAll(req.query).then(answ => res.json(answ));
	});

	app.get("/api/users/:id", (req, res) => {
		console.log(`/api/users/${req.params.id}`, req.query);
		mongoUsers.getById(req.params.id, req.query)
			.then(answ => res.json(answ));
	});

	app.get("/api/comments", (req, res) => {
		console.log("GET /api/comments", req.query);
		mongoComments.getAll(req.query).then(answ => res.json(answ));
	});
	app.post("/api/comments", jsonParser, (req, res) => {
		console.log("POST /api/comments", req.body);
		mongoComments.addComment(req.body).then(answ => res.json(answ));
	});

	app.get("/api/comments/:id", (req, res) => {
		console.log(`/api/comments/${req.params.id}`, req.query);
		mongoComments.getById(req.params.id, req.query).then(answ => res.json(answ));
	});

	app.get("/api/posts", (req, res) => {
		console.log("GET /api/posts", req.query);
		mongoPosts.getAll(req.query).then(answ => res.json(answ));
	});

	app.post("/api/posts", jsonParser, (req, res) => {
		console.log("POST /api/posts", req.body);
		mongoPosts.addPost(req.body).then(answ => res.json(answ));
	});

	app.get("/api/posts/:id", (req, res) => {
		console.log(`/api/posts/${req.params.id}`, req.query);
		mongoPosts.getById(req.params.id, req.query).then(answ => res.json(answ));
	});

	app.post("/api/posts/:id/likes", jsonParser, (req, res) => {
		console.log(`/api/posts/${req.params.id}/likes`, req.query, req.body);
		mongoPosts.actionWithLike(req.params.id, req.body.userId, req.query).then(answ => res.json(answ));
	});


	app.get("/api/users/:id/posts", (req, res) => {
		console.log(`/api/users/${req.params.id}/posts`, req.query);

		mongoPosts.getAllByOwner(req.params.id, req.query)
			.then(answ => res.json(answ))
	});

	app.post("/api/auth", jsonParser, (req, res) => {
		console.log('/api/auth body=', req.body);

		mongoAuth.getUser(req.body.login, req.body.loginPass)
			.then(result => res.json(result));
	});


	app.post("/api/register", jsonParser, (req, res) => {
		console.log('/api/register body=', req.body);

		mongoAuth.registerUser(req.body)
			.then(result => res.json(result))
	});

	app.get("/api/getUserByName", (req, res) => {
		console.log('/api/getUserByName query=', req.query);

		mongoUsers.getUserByName(req.query)
			.then(result => res.json(result))
	});


	app.get("/api/addFriend", (req, res) => {
		console.log('/api/addFriend query=', req.query);

		mongoUsers.addFriend(req.query).then(result => res.json(result))
	});


	app.get("/api/deleteFriend", (req, res) => {
		console.log('/api/deleteFriend query=', req.query);

		mongoUsers.deleteFriend(req.query).then(result => res.json(result))
	});

	app.post("/api/users/update", jsonParser, (req, res) => {
		console.log('/api/users/update body=', req.body);

		mongoUsers.updateOne(req.body).then(result => res.json(result))
	});

	app.get("/api/messages", (req, res) => {
		console.log('/api/messages query=', req.query);
		mongoMessages.find(req.query).then(result => res.json(result));
	});
}

module.exports = { createRoutes };