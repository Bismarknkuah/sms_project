const express = require('express');
const router = express.Router();
const ITAdmin = require('../models/ITAdmin');

router.get('/', async (req, res) => {
  try {
    const itAdmins = await ITAdmin.find();
    res.json(itAdmins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching IT admins' });
  }
});

router.post('/', async (req, res) => {
  try {
    const itAdmin = new ITAdmin(req.body);
    await itAdmin.save();
    res.status(201).json(itAdmin);
  } catch (error) {
    res.status(400).json({ message: 'Error creating IT admin' });
  }
});

module.exports = router;