const express = require('express');
const router = express.Router();
const { getNotifications, getUnreadCount, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
