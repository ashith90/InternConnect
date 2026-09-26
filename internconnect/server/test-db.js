const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = await User.findOne({ email: 'admin@internconnect.com' });
  if (admin) {
    const isMatch = await admin.matchPassword('Admin@123');
    console.log('Admin exists. Password match:', isMatch);
  } else {
    console.log('Admin not found!');
  }

  const company = await User.findOne({ email: 'techcorp@demo.com' });
  if (company) {
    const isMatch = await company.matchPassword('Company@123');
    console.log('Company exists. Password match:', isMatch);
  } else {
    console.log('Company not found!');
  }

  process.exit(0);
}).catch(console.error);
