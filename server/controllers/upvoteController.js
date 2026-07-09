const Report = require('../models/Report');

exports.toggleUpvote = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;

    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const hasUpvoted = report.upvotes.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      await Report.findByIdAndUpdate(reportId, {
        $pull: { upvotes: userId },
        $inc: { upvoteCount: -1 }
      });
      return res.status(200).json({ success: true, data: { upvoted: false, upvoteCount: report.upvoteCount - 1 } });
    } else {
      // Add upvote
      await Report.findByIdAndUpdate(reportId, {
        $addToSet: { upvotes: userId },
        $inc: { upvoteCount: 1 }
      });
      return res.status(200).json({ success: true, data: { upvoted: true, upvoteCount: report.upvoteCount + 1 } });
    }
  } catch (error) {
    next(error);
  }
};
