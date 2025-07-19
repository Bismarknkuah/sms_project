// src/models/Transport.js
const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  routeName:    { type: String, required: true },
  branch:       {
    type: String, required: true, enum: [
      'Assin Fosu',
      'Accra Branch',
      'Dunkwa Offin Branch',
      'Asanwinso Branch',
      'Magasim Branch'
    ]
  },
  driverName:   { type: String, required: true },
  vehicleNumber:{ type: String, required: true, unique: true },
  capacity:     { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Transport', transportSchema);
