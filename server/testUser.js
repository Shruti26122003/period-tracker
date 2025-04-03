const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/period-tracker')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const createTestUser = async () => {
  try {
    // Delete any existing test user
    await User.deleteOne({ email: 'test@example.com' });
    
    // Create plain password and hash
    const plainPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('Plain password:', plainPassword);
    console.log('Hashed password:', hashedPassword);
    
    // Create new user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      dateOfBirth: new Date('1990-01-01')
    });

    await testUser.save();
    console.log('Test user created successfully with ID:', testUser._id);
    
    // Test direct comparison
    console.log('Testing direct bcrypt.compare:');
    const directCompare = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Direct comparison result:', directCompare);
    
    // Test through model method
    const user = await User.findOne({ email: 'test@example.com' });
    console.log('Testing model comparePassword method:');
    const modelCompare = await user.comparePassword(plainPassword);
    console.log('Model comparison result:', modelCompare);
    
    // Exit the script
    process.exit(0);
  } catch (err) {
    console.error('Error creating test user:', err);
    process.exit(1);
  }
};

createTestUser(); 