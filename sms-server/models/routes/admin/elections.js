const express  = require('express');
const router   = express.Router();
const Election = require('../../models/Election');

function requireAdmin(req,res,next){
  if(req.user.role!=='admin') return res.status(403).end();
  next();
}

// Create election
router.post('/', requireAdmin, async (req,res) => {
  const e = new Election({ ...req.body, createdBy: req.user.id });
  await e.save();
  res.json(e);
});

// List all elections
router.get('/', requireAdmin, async (req,res) => {
  const list = await Election.find();
  res.json(list);
});

module.exports = router;
