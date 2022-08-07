const express = require("express");
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

const mongoComments = require("./mongoComments");
const mongoUsers = require("./mongoUsers");
const mongoPosts = require("./mongoPosts");
const mongoAuth = require("./mongoAuth");

const PORT = process.env.PORT || 3001;
const app = express();
const jsonParser = bodyParser.json();

app.use(jsonParser);
app.use(bodyParser.urlencoded({extended: false}));
app.use('/uploads', express.static('uploads'));
app.set("view engine", "ejs");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		let pathStr = path.join(__dirname + '/uploads/' + req.params.id + "/").toString();
		if (!fs.existsSync(pathStr)) {
			fs.mkdirSync(pathStr);
		}
		cb(null, pathStr)
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now() + "_" + file.originalname)
	}
});

const upload = multer({storage: storage});

const imgModel = require('./models/image');

app.post('/api/user/:id/image', upload.single('image'), (req, res) => {
	console.log("/api/image", req.params, req.file);
	// const obj = {
	// 	name: req.file.filename,
	// 	desc: "aaaa",
	// 	img: {
	// 		data: fs.readFileSync(req.file.path),
	// 		contentType: req.file.mimetype
	// 	}
	// }
	const url = req.protocol + "://" + req.get('host');
	const fullurl = url + '/uploads/' + req.params.id + "/" + req.file.filename
	console.log("URL", fullurl);
	// console.log("data", fs.readFileSync(req.file.path));

	mongoUsers.updateOne({userId: req.params.id, picture: fullurl})
		.then(answ => res.json(answ));

	// imgModel.create(obj, (err, item) => {
	// 	if (err) {
	// 		console.log(err);
	// 	} else {
	// 		item.save();
	// 		res.json("ok");
	// 	}
	// });
});


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
	console.log("/api/posts", req.query);
	mongoPosts.getAll(req.query).then(answ => res.json(answ));
});

app.get("/api/posts/:id", (req, res) => {
	console.log(`/api/posts/${req.params.id}`, req.query);
	mongoPosts.getById(req.params.id, req.query).then(answ => res.json(answ));
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
})

app.listen(PORT, () => {
	console.log(`server listening on ${PORT}`);
})


