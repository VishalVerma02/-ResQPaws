const mongoose = require('mongoose');

const SuccessStorySchema = new mongoose.Schema({
  animalName: {
    type: String,
    required: true
  },
  beforeImage: {
    type: String,
    required: true
  },
  afterImage: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Adopted ❤️'
  },
  authorName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SuccessStory', SuccessStorySchema);
