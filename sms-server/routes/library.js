const express = require('express');
const router = express.Router();
const Library = require('../models/Library');

router.get('/', async (req, res) => {
  try {
    const libraries = await Library.find();
    res.json(libraries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching libraries' });
  }
});

router.post('/', async (req, res) => {
  try {
    const library = new Library(req.body);
    await library.save();
    res.status(201).json(library);
  } catch (error) {
    res.status(400).json({ message: 'Error creating library' });
  }
});

module.exports = router;