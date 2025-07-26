const express = require('express');
const router = express.Router();
const SuperAdmin = require('../models/SuperAdmin');

router.get('/', async (req, res) => {
  try {
    const superAdmins = await SuperAdmin.find();
    res.json(superAdmins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching super admins' });
  }
});

router.post('/', async (req, res) => {
  try {
    const superAdmin = new SuperAdmin(req.body);
    await superAdmin.save();
    res.status(201).json(superAdmin);
  } catch (error) {
    res.status(400).json({ message: 'Error creating super admin' });
  }
});

module.exports = router;