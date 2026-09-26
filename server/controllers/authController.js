const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');



const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName, college, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    if (!['student', 'company'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Require at least one verification document
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one verification document' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If previously rejected, allow re-registration by updating docs
      if (existingUser.verificationStatus === 'rejected') {
        existingUser.verificationDocuments = req.files.map(f => f.path.replace(/\\/g, '/'));
        existingUser.verificationStatus = 'pending';
        existingUser.verificationNote = '';
        existingUser.verificationResubmission = true;
        await existingUser.save();
        return res.status(200).json({
          success: true,
          message: 'Documents resubmitted successfully. Your account is under review again.',
        });
      }
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const documentPaths = req.files.map(f => f.path.replace(/\\/g, '/'));

    const userData = {
      name,
      email,
      password,
      role,
      phone: phone || '',
      verificationStatus: 'pending',
      verificationDocuments: documentPaths,
    };
    if (role === 'student') userData.college = college || '';
    if (role === 'company') userData.companyName = companyName || name;

    await User.create(userData);

    // Do NOT issue tokens — account must be approved first
    res.status(201).json({
      success: true,
      message: 'Registration submitted! Your documents are under review. You will be able to log in once approved by an admin.',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    // Block pending/rejected accounts (admins bypass this check)
    if (user.role !== 'admin') {
      if (user.verificationStatus === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending verification. Please wait for admin approval.',
          verificationStatus: 'pending',
        });
      }
      if (user.verificationStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          message: user.verificationNote
            ? `Your account was rejected. Reason: ${user.verificationNote}`
            : 'Your account was rejected. Please resubmit your verification documents.',
          verificationStatus: 'rejected',
          verificationNote: user.verificationNote,
        });
      }
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};



const logout = (req, res) => {
  res.cookie('accessToken', '', { maxAge: 0 });
  res.cookie('refreshToken', '', { maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully' });
};



const resubmitDocuments = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one verification document' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }
    if (user.verificationStatus === 'approved') {
      return res.status(400).json({ success: false, message: 'Your account is already approved' });
    }

    const documentPaths = req.files.map(f => f.path.replace(/\\/g, '/'));
    user.verificationDocuments = documentPaths;
    user.verificationStatus = 'pending';
    user.verificationNote = '';
    user.verificationResubmission = true;
    await user.save();

    res.json({
      success: true,
      message: 'Documents resubmitted successfully. Your account is under review again.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const getVerificationStatus = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email }).select('verificationStatus verificationNote name role');
    if (!user) return res.status(404).json({ success: false, message: 'No account found' });

    res.json({
      success: true,
      verificationStatus: user.verificationStatus,
      verificationNote: user.verificationNote,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, logout, resubmitDocuments, getVerificationStatus };
