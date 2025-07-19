const mongoose = require('mongoose');

const transportHostelSchema = new mongoose.Schema({
  type: { type: String, enum: ['transport', 'hostel'], required: true },

  // Transport specific fields
  routeId: String,
  routeName: String,
  driverName: String,
  driverPhone: String,
  vehicleNumber: String,
  capacity: Number,
  pickupPoints: [{
    location: String,
    time: String,
    sequence: Number
  }],

  // Hostel specific fields
  hostelName: String,
  blockName: String,
  roomNumber: String,
  roomType: { type: String, enum: ['single', 'double', 'triple', 'quad'] },
  roomCapacity: Number,
  currentOccupancy: { type: Number, default: 0 },
  wardenName: String,
  wardenPhone: String,
  facilities: [String],

  // Common fields
  monthlyFee: Number,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('TransportHostel', transportHostelSchema);
