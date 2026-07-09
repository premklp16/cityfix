const express = require('express');
const router = express.Router({ mergeParams: true });
const { toggleUpvote } = require('../controllers/upvoteController');
const auth = require('../middleware/auth');

router.route('/')
  .post(auth, toggleUpvote);

module.exports = router;
