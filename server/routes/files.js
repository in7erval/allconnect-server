const multer = require('multer');
const util = require("util");
const fs = require('fs');
const path = require('path');
const imgModel = require('../models/image');
const mongoUsers = require("../dbapi/mongoUsers");



const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		let pathStr = path.join(__dirname + '/../uploads/' + req.params.id + "/").toString();
		console.log("pathStr", pathStr);
		if (!fs.existsSync(pathStr)) {
			fs.mkdirSync(pathStr);
		}
		req.body['dest'] = pathStr;
		cb(null, pathStr);
	},
	filename: async function (req, file, cb) {
		let ars = file.originalname.split(".");
		let type = ars[ars.length - 1];

		let fname = file.fieldname + "-" + req.params.id + "." + type;
		console.log("TUT", file);
		const url = req.protocol + "://" + req.get('host');
		const fullurl = url + '/uploads/' + req.params.id + "/" + fname
		console.log("URL", fullurl);

		await mongoUsers.updateOne({userId: req.params.id, picture: fullurl});

		cb(null, fname);
	}
});

const fileFilter = function (req, file, cb) {
	if (file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg") {
		console.log("pass file filter, mimetype", file.mimetype);
		cb(null, true);
	} else {
		console.log("not pass file filter, mimetype", file.mimetype);
		cb(null, false);
	}
}

const upload = multer({
	storage: storage,
	preservePath: true,
	fileFilter: fileFilter,
	limits: {
		fieldNameSize: 1024,
		fileSize: 1024 * 1024 * 5, // MB
		// parts: 1,
	},
});

function createFilesRoute(app) {
	console.log("CREATE FILES ROUTE");

	app.post('/api/user/:id/image', upload.single("image"), (req, res) => {
		console.log(`/api/user/${req.params.id}/image`, req.params);

		if (req.file == undefined) {
			console.log("ERROR");
			return res.status(400).send({ message: "Upload a file please!" });
		}

		console.log(`/api/user/${req.params.id}/image FILE:`, req.file);
		const url = req.protocol + "://" + req.get('host');
		const fullurl = url + '/uploads/' + req.params.id + "/" + req.file.filename;
		console.log("URL", fullurl);
		mongoUsers.updateOne({ userId: req.params.id, picture: fullurl });

		res.status(200).send({
			message: "The following file was uploaded successfully: " + req.file.originalname,
		});

	});
}

module.exports = { createFilesRoute };
