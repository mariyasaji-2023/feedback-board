const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feedback_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback',
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only vote once per feedback
voteSchema.index({ user_id: 1, feedback_id: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);