const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Discussion = require('../models/Discussion');
const Certificate = require('../models/Certificate');
const Submission = require('../models/Submission');


const getStats = async (req, res) => {
  try {
    const [
      totalStudents, activeStudents, totalCompanies,
      totalInternships, activeInternships, pendingInternships,
      totalApplications, selectedApplications, completedApplications,
      totalDiscussions, totalCertificates,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'company' }),
      Internship.countDocuments(),
      Internship.countDocuments({ status: 'active', isApprovedByAdmin: true }),
      Internship.countDocuments({ isApprovedByAdmin: false }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'Selected' }),
      Application.countDocuments({ status: 'Completed' }),
      Discussion.countDocuments(),
      Certificate.countDocuments(),
    ]);

    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const monthlyApps = await Application.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const recentUsers = await User.find().select('name email role createdAt isActive').sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      stats: {
        totalStudents, activeStudents, totalCompanies,
        totalInternships, activeInternships, pendingInternships,
        totalApplications, selectedApplications, completedApplications,
        selectionRate: totalApplications ? Math.round((selectedApplications / totalApplications) * 100) : 0,
        completionRate: totalApplications ? Math.round((completedApplications / totalApplications) * 100) : 0,
        totalDiscussions, totalCertificates,
        monthlyApps, recentUsers,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(query).select('-password -refreshToken').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find()
      .populate('companyId', 'companyName logo')
      .sort({ createdAt: -1 });
    res.json({ success: true, internships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateInternshipStatus = async (req, res) => {
  try {
    const { isApprovedByAdmin, status } = req.body;
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { isApprovedByAdmin, status: isApprovedByAdmin ? 'active' : 'closed' },
      { new: true }
    ).populate('companyId', 'companyName');
    if (!internship) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, internship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteDiscussion = async (req, res) => {
  try {
    const Discussion = require('../models/Discussion');
    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Discussion removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('studentId', 'name email')
      .populate('companyId', 'companyName')
      .sort({ issuedAt: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getPendingVerifications = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { role: { $in: ['student', 'company'] } };
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.verificationStatus = status;
    } else {
      query.verificationStatus = { $in: ['pending', 'rejected'] };
    }

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    const pendingCount = await User.countDocuments({
      role: { $in: ['student', 'company'] },
      verificationStatus: 'pending',
    });

    res.json({ success: true, users, pendingCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const reviewVerification = async (req, res) => {
  try {
    const { action, note } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot review admin account' });

    if (action === 'approve') {
      user.verificationStatus = 'approved';
      user.isActive = true;
      user.verificationNote = '';
    } else {
      user.verificationStatus = 'rejected';
      user.isActive = false;
      user.verificationNote = note || 'Documents were not acceptable. Please resubmit.';
    }

    await user.save();
    res.json({ success: true, user, message: `User ${action === 'approve' ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats, getUsers, toggleUser, getAllInternships, updateInternshipStatus,
  deleteDiscussion, getAllCertificates, getPendingVerifications, reviewVerification,
};
