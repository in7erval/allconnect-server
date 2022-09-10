const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Logging = require("./logging/index");
const console = new Logging(__filename);

const {initSocket} = require("./socket/socket");

const router = require('./routes/index');
const sseRouter = require('./sse/index');
const errorMiddleware = require('./middleware/errorMiddleware');

const PORT = process.env.PORT || 3001;
const app = express();
const jsonParser = bodyParser.json();

app.use(cors({
	credentials: true,
	origin: process.env.CLIENT_URL
}));

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, XSRF-TOKEN");
	next();
});

app.use(jsonParser);
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/uploads', express.static('uploads'));
app.use('/api', router);
app.use('/stream', sseRouter);

app.use(errorMiddleware);


const fs = require('fs');
const https = require('https');
const privateKey = fs.readFileSync('sslcerts/private.key', 'utf8');
const certificate = fs.readFileSync('sslcerts/certificate.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};
const server = https.createServer(credentials, app);


initSocket(server);

const start = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URL,
			{useNewUrlParser: true, useUnifiedTopology: true},
			() => {
				console.log('connected to mongo')
			});

		server.listen(PORT, () => {
			console.log(`Server ready. Port: ${PORT}`)
		});
	} catch (e) {
		console.error(e);
	}
}

start();


