const mongoose = require('mongoose');
require('dotenv/config');

const Logging = require("../logging/index");
const console = new Logging(__filename);

mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
