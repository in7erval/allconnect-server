const Router = require('express').Router;
const userAuthController = require('../controller/userAuthController');
const userController = require('../controller/userController');
const commentsController = require('../controller/commentsController');
const messagesController = require('../controller/messagesController');
const notificationsController = require('../controller/notificationsController');
const postsController = require('../controller/postsController');
const filesController = require('../controller/filesController');
const upload = require('./multer/config');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/registration',
	body('email').isEmail(),
	body('password').isLength({min: 3, max: 32}),
	body('firstName').isString(),
	body('lastName').isString(),
	userAuthController.registration);
router.post('/login', userAuthController.login);
router.post('/logout', userAuthController.logout);
// router.get('/activate/:link', userAuthController.activate);
router.get('/refresh', userAuthController.refresh);

router.get('/users', authMiddleware, userController.getUsers);
router.get('/users/getByName', authMiddleware, userController.getUserByName);
router.get('/users/deleteFriend', authMiddleware, userController.deleteFriend);
router.get('/users/addFriend', authMiddleware, userController.addFriend);
router.post('/users/update', authMiddleware, userController.update);
router.get('/users/:id', authMiddleware, userController.getUserById);
router.post('/users/:id/image', authMiddleware, upload.single("image"), userController.updatePhoto);

router.get('/comments', authMiddleware, commentsController.getAll);
router.post('/comments', authMiddleware, commentsController.addComment);
router.get('/comments/:id', authMiddleware, commentsController.getById);
router.get('/comment', authMiddleware, commentsController.getOne);

router.get('/messages', authMiddleware, messagesController.getMessages);
router.post('/messages', authMiddleware, messagesController.saveMessage);
router.get('/messages/rooms', authMiddleware, messagesController.findAllRooms);
router.get('/messages/unread', authMiddleware, messagesController.getUnreadMessages);
router.get('/messages/unread/subscribe', authMiddleware, messagesController.getUnreadMessagesSubscribe);

router.get('/notifications', authMiddleware, notificationsController.getAllById);
router.get('/notification', authMiddleware, notificationsController.getOne);

router.get('/posts', authMiddleware, postsController.getAll);
router.post('/posts', authMiddleware, postsController.addPost);
router.get('/posts/:id', authMiddleware, postsController.getById);
router.post('/posts/:id/likes', authMiddleware, postsController.actionWithLike);
router.get('/users/:id/posts', authMiddleware, postsController.getAllForUser);
router.post('/posts/:id/delete', authMiddleware, postsController.deleteById);

router.post('/files/:id/image', authMiddleware, upload.single("image"), filesController.upload);


module.exports = router;