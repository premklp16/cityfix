const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Create token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      data: { token, user }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Create token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      data: { token, user }
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    let profileImage = req.user.profileImage;

    // Handle image upload if a file was sent
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'cityfix/profiles');
      profileImage = result.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, profileImage },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
};
