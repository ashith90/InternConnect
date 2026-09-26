const Application = require('../models/Application');
const Internship = require('../models/Internship');


const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate({ path: 'internshipId', populate: { path: 'companyId', select: 'companyName logo' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getCompanyApplications = async (req, res) => {
  try {
    const internships = await Internship.find({ companyId: req.user._id }).select('_id skillsRequired');
    const internshipIds = internships.map(i => i._id);
    const applications = await Application.find({ internshipId: { $in: internshipIds } })
      .populate('studentId', 'name email phone college skills resume profileImage')
      .populate('internshipId', 'title duration stipend skillsRequired')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateStatus = async (req, res) => {
  try {
    const { status, companyFeedback } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Rejected', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id)
      .populate('internshipId', 'companyId');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.internshipId.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const oldStatus = application.status;
    application.status = status;
    if (companyFeedback) application.companyFeedback = companyFeedback;

    // Push timeline event when status changes
    if (oldStatus !== status) {
      application.timelineEvents.push({
        stage: status,
        note: companyFeedback || `Status updated to ${status}`,
        timestamp: new Date(),
      });
    }

    await application.save();
    res.json({ success: true, application, message: `Status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('studentId', 'name email phone college skills resume profileImage bio')
      .populate({ path: 'internshipId', populate: { path: 'companyId', select: 'companyName logo' } });
    if (!application) return res.status(404).json({ success: false, message: 'Not found' });

    // If viewed by the company, increment view count
    if (req.user.role === 'company') {
      await Application.findByIdAndUpdate(req.params.id, {
        $inc: { resumeViewCount: 1 },
        lastViewedAt: new Date(),
      });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyApplications, getCompanyApplications, updateStatus, getApplication };
