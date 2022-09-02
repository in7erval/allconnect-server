const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoUsers = require("../../service/userService");

const Logging = require("../../logging");
const console = new Logging(__filename);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		let pathStr = path.join(__dirname + '/../../uploads/').toString() + req.params.id + "/";
		console.log("pathStr", pathStr);
		if (!fs.existsSync(pathStr)) {
			fs.mkdirSync(pathStr, {recursive: true});
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

module.exports = upload;