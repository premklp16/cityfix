const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middleware/validate');
const auth = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, uploadSingle, updateProfile);

module.exports = router;
