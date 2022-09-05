const ApiError = require('../exceptions/apiError');

const Logging = require('../logging/index');

const console = new Logging(__filename)

module.exports = function(err, req, res, next) {
	console.error(err);
	if (err instanceof ApiError) {
		return res.status(err.status).json({message: err.message, errors: err.errors});
	}
	return res.status(500).json({message: 'Непредвиденная ошибка'});
}