const Comment = require('../models/Comment');
const Report = require('../models/Report');
const { notifyFollowers, createNotification } = require('../utils/helpers');

exports.addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const reportId = req.params.id;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const newComment = await Comment.create({
      reportId,
      userId: req.user.id,
      comment
    });

    report.commentsCount += 1;
    await report.save();

    // Notify creator if someone else commented
    if (report.createdBy.toString() !== req.user.id.toString()) {
      await createNotification(
        report.createdBy,
        `${req.user.name} commented on your report: "${report.title}"`,
        'comment',
        report._id
      );
    }

    // Notify followers
    await notifyFollowers(
      report._id,
      `New comment on "${report.title}"`,
      'comment',
      req.user.id // exclude self
    );

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const startIndex = (page - 1) * limit;

    const comments = await Comment.find({ reportId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(parseInt(limit))
      .populate('userId', 'name profileImage role');

    const total = await Comment.countDocuments({ reportId: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        comments,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
