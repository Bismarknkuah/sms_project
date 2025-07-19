const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const electionSchema = new Schema({
  title:     { type: String, required: true },
  startsAt:  { type: Date,   required: true },
  endsAt:    { type: Date,   required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Election', electionSchema);
