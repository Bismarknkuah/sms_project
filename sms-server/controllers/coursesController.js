const CourseService = require('../services/courseService');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await CourseService.getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await CourseService.createCourse(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    const course = await CourseService.enrollStudent(courseId, studentId);
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};