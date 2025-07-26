const express = require('express');
const router = express.Router();
const LibraryManagement = require('../models/LibraryManagement');

router.get('/', async (req, res) => {
  try {
    const libraryManagements = await LibraryManagement.find();
    res.json(libraryManagements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching library managements' });
  }
});

router.post('/', async (req, res) => {
  try {
    const libraryManagement = new LibraryManagement(req.body);
    await libraryManagement.save();
    res.status(201).json(libraryManagement);
  } catch (error) {
    res.status(400).json({ message: 'Error creating library management' });
  }
});

module.exports = router;