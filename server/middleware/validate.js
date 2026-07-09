const { validationResult, body } = require('express-validator');

const categories = ['Road Damage', 'Garbage', 'Water Leakage', 'Street Light', 'Drainage', 'Traffic Signal', 'Public Property Damage', 'Other'];
const severities = ['Low', 'Medium', 'High', 'Critical'];

exports.registerValidation = [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
];

exports.loginValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
];

exports.reportValidation = [
  body('title', 'Title is required').notEmpty().isLength({ max: 200 }),
  body('description', 'Description is required').notEmpty().isLength({ min: 10 }),
  body('category', 'Invalid category').isIn(categories),
  body('severity', 'Invalid severity').optional().isIn(severities),
];

exports.commentValidation = [
  body('comment', 'Comment is required').trim().notEmpty(),
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};
