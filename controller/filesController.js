
const Logging = require('../logging/index');
const ApiError = require("../exceptions/apiError");
const console = new Logging(__filename);

class FilesController {

	async upload(req, res, next) {
		try {
			if (req.file == undefined) {
				throw ApiError.BadRequest("Файл отсутствует или не был загружен");
			}
			const pathId = req.params.id;
			console.log(req.file);

			const url = req.protocol + "://" + req.get('host');
			const fullurl = url + '/uploads/' + pathId + "/" + req.file.filename;

			console.log("URL", fullurl);
			return res.json({path: fullurl});
		} catch (e) {
			console.error(e);
			next(e);
		}
	}
}

module.exports = new FilesController();