const Router = require('express').Router;
const router = new Router();
const sseController = require('./sseController');

router.get('/:userId', sseController.register);

module.exports = router;