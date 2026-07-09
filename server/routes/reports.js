const express = require('express');
const router = express.Router();
const { 
  createReport, 
  getReports, 
  getReportById, 
  updateReport, 
  deleteReport, 
  getMyReports, 
  getNearbyReports 
} = require('../controllers/reportController');
const { reportValidation, validate } = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const { uploadMultiple } = require('../middleware/upload');

// Re-route into other resource routers
const upvoteRouter = require('./upvotes');
const commentRouter = require('./comments');
const followRouter = require('./follows');

router.use('/:id/upvote', upvoteRouter);
router.use('/:id/comments', commentRouter);
router.use('/:id/follow', followRouter);

router.route('/')
  .post(auth, uploadMultiple, reportValidation, validate, createReport)
  .get(getReports);

router.get('/my', auth, getMyReports);
router.get('/nearby', getNearbyReports);

router.route('/:id')
  .get(getReportById)
  .put(auth, authorize('officer', 'admin'), uploadMultiple, updateReport)
  .delete(auth, deleteReport);

module.exports = router;
