// tests/unit/elearningService.test.js
const Course = require('../../src/models/ECourse');
const elearningService = require('../../src/services/elearningService');

jest.mock('../../src/models/ECourse');

describe('elearningService', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllCourses populates teacher', async () => {
    Course.find.mockReturnValue({ populate: () => Promise.resolve(['c1','c2']) });
    const result = await elearningService.getAllCourses();
    expect(Course.find).toHaveBeenCalled();
    expect(typeof result.then).toBe('function');
  });

  it('enrollStudent pushes studentId', async () => {
    const fakeDoc = { students: [], save: jest.fn().mockResolvedValue('saved') };
    Course.findById.mockResolvedValue(fakeDoc);
    const result = await elearningService.enrollStudent('course1','stu1');
    expect(fakeDoc.students).toContain('stu1');
    expect(fakeDoc.save).toHaveBeenCalled();
    expect(result).toBe(fakeDoc);
  });
});
