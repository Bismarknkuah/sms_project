const express   = require('express');
const router    = express.Router();
const Candidate = require('../../models/Candidate');

function requireAdmin(req,res,next){
  if(req.user.role!=='admin') return res.status(403).end();
  next();
}

// Add candidate with image
router.post('/', requireAdmin, async (req,res) => {
  const { positionId, name } = req.body;
  const imagePath = '/uploads/' + req.file.filename;
  const c = new Candidate({ positionId, name, imagePath });
  await c.save();
  res.json(c);
});

// List candidates for a position
router.get('/:positionId', requireAdmin, async (req,res) => {
  const list = await Candidate.find({ positionId: req.params.positionId });
  res.json(list);
});

module.exports = router;
