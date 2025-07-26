const ExamService = require('../services/examService');

exports.getAllExams = async (req, res) => {
  try {
    const exams = await ExamService.getAllExams();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const exam = await ExamService.createExam(req.body);
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};