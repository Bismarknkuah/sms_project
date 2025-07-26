const FinanceService = require('../services/financeService');

exports.getAllFinances = async (req, res) => {
  try {
    const finances = await FinanceService.getAllFinances();
    res.json(finances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.recordTransaction = async (req, res) => {
  try {
    const finance = await FinanceService.recordTransaction(req.body);
    res.status(201).json(finance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};