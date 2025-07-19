const express   = require('express');
const router    = express.Router();
const Election  = require('../models/Election');
const Position  = require('../models/Position');
const Candidate = require('../models/Candidate');
const Vote      = require('../models/Vote');

// List active elections
router.get('/elections', async (req,res) => {
  const now = new Date();
  const list = await Election.find({
    startsAt: { $lte: now },
    endsAt:   { $gte: now }
  });
  res.json(list);
});

// Get ballot for one election
router.get('/elections/:id/ballot', async (req,res) => {
  const positions = await Position.find({ electionId: req.params.id });
  const ballot = await Promise.all(positions.map(async pos => ({
    position: pos,
    candidates: await Candidate.find({ positionId: pos._id })
  })));
  res.json(ballot);
});

// Submit votes (array of { positionId, candidateId })
router.post('/vote', async (req,res) => {
  try {
    const { electionId, votes } = req.body;
    for (let v of votes) {
      await new Vote({
        electionId,
        positionId:  v.positionId,
        candidateId: v.candidateId,
        userId:      req.user.id
      }).save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Already voted or invalid data' });
  }
});

// Get results
router.get('/elections/:id/results', async (req,res) => {
  const mongoose = require('mongoose');
  const results = await Vote.aggregate([
    { $match: { electionId: mongoose.Types.ObjectId(req.params.id) } },
    { $group: { _id: '$candidateId', count: { $sum: 1 } } }
  ]);
  res.json(results);
});

module.exports = router;
