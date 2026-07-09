const express = require('express');
const router = express.Router({ mergeParams: true });
const { toggleFollow, getFollowedReports } = require('../controllers/followController');
const auth = require('../middleware/auth');

router.route('/')
  .post(auth, toggleFollow)
  .get(auth, getFollowedReports);

module.exports = router;
