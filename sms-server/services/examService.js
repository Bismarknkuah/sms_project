const Exam = require('../models/Exam');

class ExamService {
  static async getAllExams() {
    try {
      return await Exam.find();
    } catch (error) {
      throw new Error('Failed to fetch exams');
    }
  }

  static async createExam(data) {
    try {
      const exam = new Exam(data);
      return await exam.save();
    } catch (error) {
      throw new Error('Failed to create exam');
    }
  }
}

module.exports = ExamService;