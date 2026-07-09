const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const startIndex = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(parseInt(limit))
      .populate('reportId', 'title');

    const total = await Notification.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
