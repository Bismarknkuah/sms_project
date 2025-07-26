const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');

router.get('/', async (req, res) => {
  try {
    const fees = await Fee.find();
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fees' });
  }
});

router.post('/pay', async (req, res) => {
  try {
    const { studentId, amount } = req.body;
    const fee = new Fee({ studentId, amount, status: 'paid', date: new Date() });
    await fee.save();
    res.status(201).json(fee);
  } catch (error) {
    res.status(400).json({ message: 'Error processing payment' });
  }
});

module.exports = router;