const Follow = require('../models/Follow');
const Report = require('../models/Report');

exports.toggleFollow = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;

    const existingFollow = await Follow.findOne({ reportId, userId });

    if (existingFollow) {
      await existingFollow.deleteOne();
      return res.status(200).json({ success: true, data: { following: false } });
    } else {
      await Follow.create({ reportId, userId });
      return res.status(201).json({ success: true, data: { following: true } });
    }
  } catch (error) {
    next(error);
  }
};

exports.getFollowedReports = async (req, res, next) => {
  try {
    const follows = await Follow.find({ userId: req.user.id }).populate('reportId');
    
    // Extract reports and filter out any nulls (if report was deleted)
    const reports = follows.map(f => f.reportId).filter(r => r !== null);

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};
