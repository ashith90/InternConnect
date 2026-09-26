require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');


connectDB();

const app = express();


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files with explicit CORS headers so browsers can open them
// cross-origin (e.g. frontend at :5173 fetching files from :5000)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/internships', require('./routes/internships'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/admin', require('./routes/admin'));


app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'InternConnect API running' }));


const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@internconnect.com',
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
        verificationStatus: 'approved',
      });
      console.log('✅ Admin account seeded: admin@internconnect.com / Admin@123');
    } else if (adminExists.verificationStatus !== 'approved') {
      await User.updateOne({ role: 'admin' }, { verificationStatus: 'approved' });
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};


const seedSampleData = async () => {
  try {
    const studentExists = await User.findOne({ role: 'student', email: 'student@demo.com' });
    if (!studentExists) {
      await User.create({
        name: 'Demo Student',
        email: 'student@demo.com',
        password: 'Student@123',
        role: 'student',
        college: 'Demo University',
        isActive: true,
        verificationStatus: 'approved',
      });
      console.log('✅ Demo Student account seeded');
    } else if (studentExists.verificationStatus !== 'approved') {
      await User.updateOne({ email: 'student@demo.com' }, { verificationStatus: 'approved' });
    }

    const companyExists = await User.findOne({ role: 'company', email: 'techcorp@demo.com' });
    if (!companyExists) {
      const company = await User.create({
        name: 'TechCorp Solutions',
        email: 'techcorp@demo.com',
        password: 'Company@123',
        role: 'company',
        companyName: 'TechCorp Solutions',
        industry: 'Information Technology',
        description: 'Leading tech company specializing in software development, AI/ML, and cloud solutions.',
        website: 'https://techcorp.example.com',
        location: 'Bangalore, India',
        isActive: true,
        verificationStatus: 'approved',
      });

      const Internship = require('./models/Internship');
      const internships = [
        {
          title: 'Frontend Developer Intern',
          description: 'Work on modern React.js applications, build reusable components, and collaborate with the design team to deliver pixel-perfect UIs.',
          skillsRequired: ['React.js', 'JavaScript', 'CSS', 'Git'],
          stipend: 15000,
          duration: '3 Months',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          domain: 'Web Development',
          location: 'Remote',
          openings: 5,
          companyId: company._id,
          status: 'active',
          isApprovedByAdmin: true,
        },
        {
          title: 'Machine Learning Intern',
          description: 'Research and implement ML models for real-world problems. Work with Python, TensorFlow, and large datasets.',
          skillsRequired: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas'],
          stipend: 20000,
          duration: '6 Months',
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          domain: 'Artificial Intelligence',
          location: 'Hybrid',
          openings: 3,
          companyId: company._id,
          status: 'active',
          isApprovedByAdmin: true,
        },
        {
          title: 'Backend Developer Intern',
          description: 'Build scalable REST APIs using Node.js and Express. Work with MongoDB and design efficient database schemas.',
          skillsRequired: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
          stipend: 18000,
          duration: '3 Months',
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          domain: 'Web Development',
          location: 'Remote',
          openings: 4,
          companyId: company._id,
          status: 'active',
          isApprovedByAdmin: true,
        },
        {
          title: 'UI/UX Design Intern',
          description: 'Create stunning wireframes, prototypes and user experiences. Collaborate with developers to implement designs.',
          skillsRequired: ['Figma', 'Adobe XD', 'UI Design', 'Prototyping'],
          stipend: 12000,
          duration: '2 Months',
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          domain: 'Design',
          location: 'Remote',
          openings: 2,
          companyId: company._id,
          status: 'active',
          isApprovedByAdmin: true,
        },
        {
          title: 'Data Science Intern',
          description: 'Analyze large datasets, build dashboards, and extract insights. Experience with SQL and visualization tools preferred.',
          skillsRequired: ['Python', 'SQL', 'Pandas', 'Matplotlib', 'Power BI'],
          stipend: 16000,
          duration: '4 Months',
          deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          domain: 'Data Science',
          location: 'Bangalore, India',
          openings: 3,
          companyId: company._id,
          status: 'active',
          isApprovedByAdmin: true,
        },
      ];
      await Internship.insertMany(internships);
      console.log('✅ Sample company and 5 internships seeded');
    } else if (companyExists.verificationStatus !== 'approved') {
      await User.updateOne({ email: 'techcorp@demo.com' }, { verificationStatus: 'approved' });
    }
  } catch (err) {
    console.error('Sample data seed error:', err.message);
  }
};


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`\n🚀 InternConnect Server running on port ${PORT}`);
  await seedAdmin();
  await seedSampleData();
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
  console.log(`📧 Admin: admin@internconnect.com | Password: Admin@123`);
  console.log(`🏢 Demo Company: techcorp@demo.com | Password: Company@123\n`);
});
