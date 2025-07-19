// src/models/ResourceCategory.js
const mongoose = require('mongoose');

const resourceCategorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ResourceCategory', resourceCategorySchema);
