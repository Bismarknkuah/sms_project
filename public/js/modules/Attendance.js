// sms-server/routes/attendance.js
const express    = require('express');
const mongoose   = require('mongoose');
const router     = express.Router();
const Attendance = require('../models/Attendance');

// Middleware: only teachers may mark attendance
function requireTeacher(req, res, next) {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can perform this action' });
  }
  next();
}

/**
 * POST /api/attendance/mark
 * Mark attendance for a single student
 * Body: { classId, studentId, date, present }
 */
router.post('/mark', requireTeacher, async (req, res) => {
  try {
    const { classId, studentId, date, present } = req.body;
    const rec = await Attendance.mark(
      mongoose.Types.ObjectId(classId),
      mongoose.Types.ObjectId(studentId),
      date,
      present,
      mongoose.Types.ObjectId(req.user.id)
    );
    res.json({ success: true, record: rec });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

/**
 * POST /api/attendance/bulk
 * Bulk upsert attendance records
 * Body: { classId, date, records: [{ studentId, present }, …] }
 */
router.post('/bulk', requireTeacher, async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    const ops = records.map(r => ({
      updateOne: {
        filter:  {
          classId:   mongoose.Types.ObjectId(classId),
          studentId: mongoose.Types.ObjectId(r.studentId),
          date
        },
        update: {
          $set: {
            present:  r.present,
            markedBy: mongoose.Types.ObjectId(req.user.id)
          }
        },
        upsert: true
      }
    }));
    await Attendance.bulkWrite(ops);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Bulk update failed' });
  }
});

/**
 * GET /api/attendance
 * Query params: classId, date (YYYY-MM-DD)
 * Returns list of attendance records for that class & date
 */
router.get('/', async (req, res) => {
  try {
    const { classId, date } = req.query;
    const list = await Attendance.find({
      classId: mongoose.Types.ObjectId(classId),
      date:    new Date(date).setHours(0,0,0,0)
    })
    .populate('studentId', 'name')  // require Student model with `name` field
    .populate('markedBy',  'username'); // require User model
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

/**
 * GET /api/attendance/summary
 * Query params: classId, date (YYYY-MM-DD)
 * Returns { presentCount, absentCount }
 */
router.get('/summary', async (req, res) => {
  try {
    const { classId, date } = req.query;
    const summary = await Attendance.summary(
      mongoose.Types.ObjectId(classId),
      date
    );
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
