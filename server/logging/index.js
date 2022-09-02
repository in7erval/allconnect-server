class Logging {

	filename = "";

	constructor(filename) {
		this.filename = Logging.getFilename(filename);
	}

	info(...args) {
		console.log("INFO", this.filename, ...args);
	}

	log(...args) {
		console.log("LOG", this.filename, ...args);
	}

	error(...args) {
		console.error("ERROR", this.filename, ...args);
	}

	debug(...args) {
		console.debug("DEBUG", this.filename, ...args);
	}

	static getFilename(filenameRaw) {
		let splits = filenameRaw.split("/");
		if (splits.length > 0) return splits[splits.length - 1];
		return filenameRaw;
	}

}

module.exports = Logging;

