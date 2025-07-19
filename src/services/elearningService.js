const Course = require('../models/ECourse');

/**
 * Fetch all courses.
 */
async function getAllCourses() {
  return Course.find().populate('teacherId', 'firstName lastName');
}

/**
 * Fetch course by ID.
 */
async function getCourseById(id) {
  return Course.findById(id).populate('teacherId', 'firstName lastName');
}

/**
 * Create a new course.
 */
async function createCourse(data) {
  return Course.create(data);
}

/**
 * Update course by ID.
 */
async function updateCourse(id, data) {
  return Course.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete a course by ID.
 */
async function deleteCourse(id) {
  return Course.findByIdAndDelete(id);
}

/**
 * Enroll a student in a course.
 */
async function enrollStudent(courseId, studentId) {
  const course = await Course.findById(courseId);
  if (!course.students.includes(studentId)) {
    course.students.push(studentId);
    await course.save();
  }
  return course;
}

/**
 * Get all courses a student is enrolled in.
 */
async function getStudentCourses(studentId) {
  return Course.find({ students: studentId }).populate('teacherId', 'firstName lastName');
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  getStudentCourses
};
