const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional in JSON fallback mode, but typed for Mongo
  },
  reporterName: {
    type: String,
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  volunteerName: {
    type: String,
    default: null
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  ngoName: {
    type: String,
    default: null
  },
  animalType: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  location: {
    type: String, // Coords or area
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['reported', 'accepted', 'completed', 'cancelled'],
    default: 'reported'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'fake'],
    default: 'pending'
  },
  distance: {
    type: String,
    default: '1.5 km away'
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  }
});

module.exports = mongoose.models.Report || mongoose.model('Report', ReportSchema);
