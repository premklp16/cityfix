const express = require('express');
const router = express.Router({ mergeParams: true });
const { addComment, getComments } = require('../controllers/commentController');
const { commentValidation, validate } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.route('/')
  .post(auth, commentValidation, validate, addComment)
  .get(getComments);

module.exports = router;
