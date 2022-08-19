const multer = require('multer');
const fs = require('fs');
const path = require('path');
const imgModel = require('../models/image');
const mongoUsers = require("../dbapi/mongoUsers");


const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		let pathStr = path.join(__dirname + '/../uploads/' + req.params.id + "/").toString();
		if (!fs.existsSync(pathStr)) {
			fs.mkdirSync(pathStr);
		}
		cb(null, pathStr)
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now() + "_" + file.originalname)
	}
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg") {
		cb(null, true);
	} else {
		cb(null, false);
	}
}

const upload = multer({storage: storage, fileFilter: fileFilter});

function createFilesRoute(app) {

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
}

module.exports = {createFilesRoute};
