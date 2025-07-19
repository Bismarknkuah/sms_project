// tests/unit/gradeService.test.js
const Grade = require('../../src/models/Grade');
const gradeService = require('../../src/services/gradeService');

jest.mock('../../src/models/Grade');

describe('gradeService', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllGrades should return array', async () => {
    const fake = [{ grade: 'A' }];
    Grade.find.mockResolvedValue(fake);
    const result = await gradeService.getAllGrades();
    expect(Grade.find).toHaveBeenCalled();
    expect(result).toBe(fake);
  });

  it('createGrade should create entry', async () => {
    const data = { grade: 'B' };
    Grade.create.mockResolvedValue(data);
    const result = await gradeService.createGrade(data);
    expect(Grade.create).toHaveBeenCalledWith(data);
    expect(result).toBe(data);
  });
});
