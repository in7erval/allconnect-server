const express = require("express");
const bodyParser = require('body-parser');
const http = require('http');
require('dotenv/config');

const { initSocket } = require("./socket/socket");
const { createRoutes } = require("./routes/routes");
const { createFilesRoute } = require("./routes/files");

const PORT = process.env.PORT || 3001;
const app = express();
const jsonParser = bodyParser.json();

app.use(jsonParser);
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set("view engine", "ejs");

createFilesRoute(app);
createRoutes(app);

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
	console.log(`Server ready. Port: ${PORT}`)
});

