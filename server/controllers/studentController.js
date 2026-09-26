const User = require('../models/User');
const Application = require('../models/Application');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Certificate = require('../models/Certificate');


const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateProfile = async (req, res) => {
  try {
    const { name, phone, college, bio, skills, portfolio, education } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (college !== undefined) updates.college = college;
    if (bio !== undefined) updates.bio = bio;
    if (skills) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (portfolio !== undefined) updates.portfolio = portfolio;
    if (education) updates.education = typeof education === 'string' ? JSON.parse(education) : education;

    if (req.file) updates.profileImage = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password -refreshToken');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resume: `/uploads/resumes/${req.file.filename}` },
      { new: true }
    ).select('-password -refreshToken');
    res.json({ success: true, user, message: 'Resume uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const applications = await Application.find({ studentId })
      .populate('internshipId', 'title duration skillsRequired companyId')
      .sort({ createdAt: -1 });
    const assignments = await Assignment.find({ assignedTo: studentId });
    const submissions = await Submission.find({ studentId });
    const certificates = await Certificate.find({ studentId });

    const totalAssignments = assignments.length;
    const submittedAssignments = submissions.filter(s => ['Submitted', 'Reviewed', 'Approved'].includes(s.status)).length;
    const approvedAssignments = submissions.filter(s => s.status === 'Approved').length;

    const user = await User.findById(studentId).select('name skills college profileImage resume bio portfolio education phone createdAt');

    // Profile completion
    const profileFields = ['name', 'phone', 'college', 'bio', 'skills', 'resume', 'portfolio', 'profileImage'];
    const completedFields = profileFields.filter(f => {
      const val = user[f];
      return val && (Array.isArray(val) ? val.length > 0 : val !== '');
    }).length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    // Career Readiness Score (composite metric)
    // Weights: Profile 25%, Skills 25%, Assignments 25%, Applications 15%, Certificates 10%
    const skillScore = Math.min(100, (user.skills?.length || 0) * 10); // 10 skills = 100%
    const assignmentScore = totalAssignments > 0 ? Math.round((approvedAssignments / totalAssignments) * 100) : 0;
    const applicationScore = Math.min(100, applications.length * 20); // 5 applications = 100%
    const certScore = Math.min(100, certificates.length * 33); // 3 certs = 100%

    const careerReadiness = Math.round(
      (profileCompletion * 0.25) +
      (skillScore * 0.25) +
      (assignmentScore * 0.25) +
      (applicationScore * 0.15) +
      (certScore * 0.10)
    );

    // Today's missions (dynamic based on what's missing)
    const missions = [];
    if (profileCompletion < 100) missions.push({ task: 'Complete your profile', link: '/student/profile', done: false });
    if ((user.skills?.length || 0) < 5) missions.push({ task: 'Add more skills to your profile', link: '/student/profile', done: false });
    const pendingAssignments = assignments.filter(a => !submissions.find(s => s.assignmentId.toString() === a._id.toString() && ['Submitted','Reviewed','Approved'].includes(s.status)));
    if (pendingAssignments.length > 0) missions.push({ task: `Submit pending assignment: "${pendingAssignments[0].title}"`, link: '/student/assignments', done: false });
    if (applications.length === 0) missions.push({ task: 'Apply to your first internship', link: '/student/internships', done: false });
    if (missions.length === 0) missions.push({ task: 'Browse new internship opportunities', link: '/student/internships', done: false });

    // Activity streak based on submissions + applications
    const allDates = [
      ...submissions.map(s => s.submittedAt || s.createdAt),
      ...applications.map(a => a.appliedAt || a.createdAt),
    ].sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    if (allDates.length > 0) {
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      const uniqueDays = [...new Set(allDates.map(d => new Date(d).toDateString()))];
      for (const dayStr of uniqueDays) {
        const day = new Date(dayStr);
        const diff = Math.round((checkDate - day) / (1000 * 60 * 60 * 24));
        if (diff <= 1) { streak++; checkDate = day; }
        else break;
      }
    }

    const stats = {
      profileCompletion,
      careerReadiness,
      skillScore,
      assignmentScore,
      applicationScore,
      certScore,
      streak,
      totalApplications: applications.length,
      selectedApplications: applications.filter(a => a.status === 'Selected').length,
      completedInternships: applications.filter(a => a.status === 'Completed').length,
      totalAssignments,
      submittedAssignments,
      approvedAssignments,
      assignmentCompletion: totalAssignments ? Math.round((submittedAssignments / totalAssignments) * 100) : 0,
      skills: user.skills || [],
      recentApplications: applications.slice(0, 5),
      certificates: certificates.length,
      missions: missions.slice(0, 3),
      joinedAt: user.createdAt,
    };
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile, uploadResume, getProgress };
