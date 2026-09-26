const Internship = require('../models/Internship');
const Application = require('../models/Application');
const User = require('../models/User');


const getInternships = async (req, res) => {
  try {
    const { search, domain, minStipend, maxStipend, duration, status } = req.query;
    const query = { isApprovedByAdmin: true, status: { $ne: 'closed' } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (domain) query.domain = { $regex: domain, $options: 'i' };
    if (duration) query.duration = { $regex: duration, $options: 'i' };
    if (minStipend) query.stipend = { ...query.stipend, $gte: Number(minStipend) };
    if (maxStipend) query.stipend = { ...query.stipend, $lte: Number(maxStipend) };

    const internships = await Internship.find(query)
      .populate('companyId', 'companyName logo industry location website')
      .sort({ createdAt: -1 });

    res.json({ success: true, internships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('companyId', 'companyName logo industry location website description');
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

    const applicationCount = await Application.countDocuments({ internshipId: req.params.id });
    res.json({ success: true, internship, applicationCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const createInternship = async (req, res) => {
  try {
    const { title, description, skillsRequired, stipend, duration, deadline, domain, location, openings } = req.body;

    // Explicit validation for required fields
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required.' });
    if (!description || !description.trim()) return res.status(400).json({ success: false, message: 'Description is required.' });
    if (!duration || !duration.trim()) return res.status(400).json({ success: false, message: 'Duration is required.' });
    if (!deadline) return res.status(400).json({ success: false, message: 'Deadline is required.' });

    // Safe parse for skillsRequired
    let parsedSkills = [];
    if (Array.isArray(skillsRequired)) {
      parsedSkills = skillsRequired;
    } else if (skillsRequired && skillsRequired.trim()) {
      parsedSkills = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
    }

    const internship = await Internship.create({
      title: title.trim(),
      description: description.trim(),
      skillsRequired: parsedSkills,
      stipend: Number(stipend) || 0,
      duration: duration.trim(),
      deadline,
      domain: domain || '',
      location: location || 'Remote',
      openings: Number(openings) || 1,
      companyId: req.user._id,
      status: 'pending',
      isApprovedByAdmin: false,
    });
    res.status(201).json({ success: true, internship });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, companyId: req.user._id });
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found or unauthorized' });

    const updates = { ...req.body };

    // Explicit validation for required fields if they are being updated
    if ('title' in updates && (!updates.title || !updates.title.trim())) return res.status(400).json({ success: false, message: 'Title is required.' });
    if ('description' in updates && (!updates.description || !updates.description.trim())) return res.status(400).json({ success: false, message: 'Description is required.' });
    if ('duration' in updates && (!updates.duration || !updates.duration.trim())) return res.status(400).json({ success: false, message: 'Duration is required.' });
    if ('deadline' in updates && !updates.deadline) return res.status(400).json({ success: false, message: 'Deadline is required.' });

    // Safe parse for skillsRequired
    if ('skillsRequired' in updates) {
      if (Array.isArray(updates.skillsRequired)) {
        // already an array, keep as-is
      } else if (updates.skillsRequired && updates.skillsRequired.trim()) {
        updates.skillsRequired = updates.skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        updates.skillsRequired = [];
      }
    }

    Object.assign(internship, updates);
    await internship.save();
    res.json({ success: true, internship });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findOneAndDelete({ _id: req.params.id, companyId: req.user._id });
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found or unauthorized' });
    res.json({ success: true, message: 'Internship deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const applyInternship = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
    if (internship.deadline < new Date()) return res.status(400).json({ success: false, message: 'Application deadline has passed' });

    const student = await User.findById(req.user._id);
    const application = await Application.create({
      studentId: req.user._id,
      internshipId: req.params.id,
      coverLetter: coverLetter || '',
      resume: student.resume || '',
      status: 'Applied',
    });
    res.status(201).json({ success: true, application, message: 'Applied successfully!' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'You have already applied for this internship' });
    res.status(500).json({ success: false, message: error.message });
  }
};


const getCompanyInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ companyId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, internships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInternships, getInternship, createInternship, updateInternship, deleteInternship, applyInternship, getCompanyInternships };
