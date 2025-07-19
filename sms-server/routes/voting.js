// sms-server/routes/voting.js
const express  = require('express');
const mongoose = require('mongoose');
const router   = express.Router();
const Election = require('../models/Election');
const Vote     = require('../models/Vote');

// POST /api/voting
// Teacher creates a new election
router.post('/', async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can create elections' });
  }
  const e = new Election({ ...req.body, createdBy: req.user.id });
  await e.save();
  res.json(e);
});

// GET /api/voting
// List currently active elections
router.get('/', async (req, res) => {
  const now = new Date();
  const list = await Election.find({
    startsAt: { $lte: now },
    endsAt:   { $gte: now }
  });
  res.json(list);
});

// POST /api/voting/:id/vote
// Student casts a vote
router.post('/:id/vote', async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can vote' });
  }
  const { choice } = req.body;
  const vote = new Vote({
    electionId: req.params.id,
    userId:     req.user.id,
    choice
  });
  await vote.save();
  res.json({ success: true });
});

// GET /api/voting/:id/results
// Get vote counts per choice
router.get('/:id/results', async (req, res) => {
  const results = await Vote.aggregate([
    { $match: { electionId: mongoose.Types.ObjectId(req.params.id) }},
    { $group: { _id: '$choice', count: { $sum: 1 } } }
  ]);
  res.json(results);
});

module.exports = router;
