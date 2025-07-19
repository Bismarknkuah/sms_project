const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const positionSchema = new Schema({
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  name:       { type: String, required: true }
});

module.exports = mongoose.model('Position', positionSchema);
