const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    sparse: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  weight: {
    type: Number
  },
  waterIntake: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving (using a synchronous approach for simplicity)
UserSchema.pre('save', function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = bcrypt.genSaltSync(10);
    // Hash the password along with our new salt
    this.password = bcrypt.hashSync(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords (synchronous for simplicity)
UserSchema.methods.comparePassword = function(candidatePassword) {
  try {
    return bcrypt.compareSync(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema); 