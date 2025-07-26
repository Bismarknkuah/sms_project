const Student = require('../models/Student');

class StudentService {
  static async getAllStudents() {
    try {
      return await Student.find();
    } catch (error) {
      throw new Error('Failed to fetch students');
    }
  }

  static async createStudent(data) {
    try {
      const student = new Student(data);
      return await student.save();
    } catch (error) {
      throw new Error('Failed to create student');
    }
  }
}

module.exports = StudentService;