const Course = require('../models/Course');

class CourseService {
  static async getAllCourses() {
    try {
      return await Course.find();
    } catch (error) {
      throw new Error('Failed to fetch courses');
    }
  }

  static async createCourse(data) {
    try {
      const course = new Course(data);
      return await course.save();
    } catch (error) {
      throw new Error('Failed to create course');
    }
  }

  static async enrollStudent(courseId, studentId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) throw new Error('Course not found');
      if (!course.students) course.students = [];
      if (!course.students.includes(studentId)) course.students.push(studentId);
      return await course.save();
    } catch (error) {
      throw new Error('Failed to enroll student');
    }
  }
}

module.exports = CourseService;