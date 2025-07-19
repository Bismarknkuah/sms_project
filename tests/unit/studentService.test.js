// tests/unit/studentService.test.js
const mongoose = require('mongoose');
const Student = require('../../src/models/Student');
const studentService = require('../../src/services/studentService');

jest.mock('../../src/models/Student');

describe('studentService', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllStudents should return all students', async () => {
    const fake = [{ name: 'Alice' }, { name: 'Bob' }];
    Student.find.mockResolvedValue(fake);
    const result = await studentService.getAllStudents();
    expect(Student.find).toHaveBeenCalled();
    expect(result).toBe(fake);
  });

  it('getStudentById should return one student', async () => {
    const fake = { name: 'Alice' };
    Student.findById.mockResolvedValue(fake);
    const result = await studentService.getStudentById('id1');
    expect(Student.findById).toHaveBeenCalledWith('id1');
    expect(result).toBe(fake);
  });

  it('createStudent should create and return student', async () => {
    const data = { name: 'Carol' };
    Student.create.mockResolvedValue(data);
    const result = await studentService.createStudent(data);
    expect(Student.create).toHaveBeenCalledWith(data);
    expect(result).toBe(data);
  });

  it('updateStudent should findByIdAndUpdate and return new doc', async () => {
    const updated = { name: 'Dan' };
    Student.findByIdAndUpdate.mockResolvedValue(updated);
    const result = await studentService.updateStudent('id2', { name: 'Dan' });
    expect(Student.findByIdAndUpdate).toHaveBeenCalledWith('id2', { name: 'Dan' }, { new: true });
    expect(result).toBe(updated);
  });

  it('deleteStudent should findByIdAndDelete', async () => {
    Student.findByIdAndDelete.mockResolvedValue(true);
    const result = await studentService.deleteStudent('id3');
    expect(Student.findByIdAndDelete).toHaveBeenCalledWith('id3');
    expect(result).toBe(true);
  });
});
