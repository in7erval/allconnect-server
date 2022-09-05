const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require('crypto');
const mongoUsers = require("../../service/userService");

const Logging = require("../../logging");
const console = new Logging(__filename);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const pathId = req.params.id ?? req.params.roomId;
		const pathStr = path.join(__dirname + '/../../uploads/').toString() + pathId + "/";

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
		const pathId = req.params.id ?? req.params.roomId;

		let fname = `${file.fieldname}-${pathId}`;
		if (req.params.roomId) {
			fname += crypto.randomUUID().toString();
		}
		fname += `.${type}`;

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