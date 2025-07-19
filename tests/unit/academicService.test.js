// tests/unit/academicService.test.js
const AcademicRecord = require('../../src/models/AcademicRecord');
const academicService = require('../../src/services/academicService');

jest.mock('../../src/models/AcademicRecord');

describe('academicService', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllRecords should fetch all', async () => {
    const fake = [{ score: 80 }];
    AcademicRecord.find.mockResolvedValue(fake);
    const result = await academicService.getAllRecords();
    expect(AcademicRecord.find).toHaveBeenCalledWith();
    expect(result).toBe(fake);
  });

  it('getRecordById should find by ID', async () => {
    const fake = { score: 90 };
    AcademicRecord.findById.mockResolvedValue(fake);
    const result = await academicService.getRecordById('rid');
    expect(AcademicRecord.findById).toHaveBeenCalledWith('rid');
    expect(result).toBe(fake);
  });

  it('generateReport should filter by type and period', async () => {
    const fake = [{ score: 70 }];
    AcademicRecord.find.mockResolvedValue(fake);
    const result = await academicService.generateReport('midterm', '2025');
    expect(AcademicRecord.find).toHaveBeenCalledWith({ type: 'midterm', period: '2025' });
    expect(result).toBe(fake);
  });
});
