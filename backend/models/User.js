const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
  role: {
    type: String,
    enum: ['reporter', 'volunteer', 'ngo', 'admin'],
    default: 'reporter'
  },
  ngoDetails: {
    registrationId: { type: String, default: '' },
    description: { type: String, default: '' },
    contactPhone: { type: String, default: '' }
  },
  volunteerDetails: {
    rating: { type: Number, default: 5.0 },
    completedCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },

  profilePicture: {
    type: String,
    default: ''
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Avoid model recompilation errors during hot reload
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
