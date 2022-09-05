const EventEmitter = require("events");

const emitter = new EventEmitter();
const NOTIFICATIONS_EVENT_NAME = "newNotifications";
const COMMENTS_EVENT_NAME = "newComment";
const UNREAD_MESSAGES_EVENT_NAME = "newUnreadMessage";

module.exports = {
	emitter,
	NOTIFICATIONS_EVENT_NAME,
	COMMENTS_EVENT_NAME,
	UNREAD_MESSAGES_EVENT_NAME
}