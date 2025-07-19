const express   = require('express');
const router    = express.Router();
const Position  = require('../../models/Position');

function requireAdmin(req,res,next){
  if(req.user.role!=='admin') return res.status(403).end();
  next();
}

// Add position
router.post('/', requireAdmin, async (req,res) => {
  const p = new Position(req.body);
  await p.save();
  res.json(p);
});

// List positions for an election
router.get('/:electionId', requireAdmin, async (req,res) => {
  const list = await Position.find({ electionId: req.params.electionId });
  res.json(list);
});

module.exports = router;
