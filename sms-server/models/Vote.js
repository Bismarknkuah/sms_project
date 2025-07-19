const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  electionId:  { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  positionId:  { type: Schema.Types.ObjectId, ref: 'Position', required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  userId:      { type: String, required: true },
  votedAt:     { type: Date, default: Date.now }
});

// One vote per user per position per election
voteSchema.index(
  { electionId: 1, positionId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model('Vote', voteSchema);
