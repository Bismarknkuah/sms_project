const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['Assin Fosu', 'Accra', 'Mankessim', 'Takoradi', 'Sefwi Asawinso', 'Dunkwa-on-Offin', 'New Edubiase'], unique: true },
  location: { type: String, required: true },
  headmasterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Headmaster', required: true },
  capacity: { type: Number, required: true, min: 100, max: 2000 },
  isActive: { type: Boolean, default: true },
  contactNumber: { type: String, match: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/ },
  email: { type: String, match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/ },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Branch', branchSchema);