const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const Vote = require('../models/Vote');

// IMPORTANT: Get user's votes - MUST come before /:id route
router.get('/user/votes', auth, async (req, res) => {
  try {
    const votes = await Vote.find({ user_id: req.user.userId });
    const votedFeedbackIds = votes.map(vote => vote.feedback_id.toString());
    res.json(votedFeedbackIds);
  } catch (error) {
    console.error('Error fetching user votes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all feedbacks
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const feedbacks = await Feedback.find(filter)
      .populate('created_by', 'name email')
      .sort({ votes_count: -1, createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single feedback
router.get('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('created_by', 'name email');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create feedback
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    const feedback = new Feedback({
      title,
      description,
      created_by: req.user.userId,
      votes_count: 0 // Explicitly set to 0
    });

    await feedback.save();
    await feedback.populate('created_by', 'name email');

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on feedback - FIXED VERSION
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user.userId;

    // Check if feedback exists
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      user_id: userId,
      feedback_id: feedbackId
    });

    if (existingVote) {
      // Remove vote (toggle off)
      await Vote.deleteOne({ _id: existingVote._id });
      
      // Recalculate vote count from database to ensure accuracy
      const voteCount = await Vote.countDocuments({ feedback_id: feedbackId });
      feedback.votes_count = voteCount;
      await feedback.save();
      
      return res.json({ 
        message: 'Vote removed', 
        votes_count: feedback.votes_count,
        voted: false
      });
    } else {
      // Add vote (toggle on)
      const vote = new Vote({
        user_id: userId,
        feedback_id: feedbackId
      });

      await vote.save();
      
      // Recalculate vote count from database to ensure accuracy
      const voteCount = await Vote.countDocuments({ feedback_id: feedbackId });
      feedback.votes_count = voteCount;
      await feedback.save();

      res.json({ 
        message: 'Vote added', 
        votes_count: feedback.votes_count,
        voted: true
      });
    }
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update feedback status (optional - for admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Planned', 'In Progress', 'Completed', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.status = status;
    await feedback.save();
    await feedback.populate('created_by', 'name email');

    res.json(feedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;