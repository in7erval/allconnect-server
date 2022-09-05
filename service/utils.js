const ApiError = require("../exceptions/apiError");

function isQueryValid(query) {
	if (query.page !== undefined && +query.page <= 0) {
		return false;
	}
	return !(query.limit !== undefined && +query.limit <= 0);
}

function parseQuery(query) {
	if (!isQueryValid(query)) {
		console.error("query in not valid: ", query);
		throw ApiError.BadRequest(`Параметры запроса не валидны: ${query}`);
	}

	let limit = 10, skipCount = 0;

	let page = query.page === undefined ? 1 : +query.page;
	limit = query.limit === undefined ? 10 : +query.limit;
	skipCount = (page - 1) * limit;
	if (query.all !== undefined) {
		limit = Infinity;
		skipCount = 0;
	}
	return {limit, skipCount};
}

exports.parseQuery = parseQuery;