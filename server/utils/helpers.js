const Notification = require('../models/Notification');
const Follow = require('../models/Follow');

exports.createNotification = async (userId, message, type, reportId = null) => {
  try {
    await Notification.create({
      userId,
      message,
      type,
      reportId,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

exports.notifyFollowers = async (reportId, message, type, excludeUserId = null) => {
  try {
    const followers = await Follow.find({ reportId });
    
    const notificationPromises = followers.map((follower) => {
      // Don't notify the person who triggered the notification if excludeUserId is provided
      if (excludeUserId && follower.userId.toString() === excludeUserId.toString()) {
        return Promise.resolve();
      }
      
      return Notification.create({
        userId: follower.userId,
        message,
        type,
        reportId,
      });
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error notifying followers:', error);
  }
};
