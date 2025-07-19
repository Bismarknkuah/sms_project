const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const candidateSchema = new Schema({
  positionId: { type: Schema.Types.ObjectId, ref: 'Position', required: true },
  name:       { type: String, required: true },
  imagePath:  { type: String, required: true }
});

module.exports = mongoose.model('Candidate', candidateSchema);
