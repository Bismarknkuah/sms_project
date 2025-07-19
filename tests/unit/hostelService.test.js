// tests/unit/hostelService.test.js
const Hostel = require('../../src/models/Hostel');
const hostelService = require('../../src/services/hostelService');

jest.mock('../../src/models/Hostel');

describe('hostelService', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllHostels returns list', async () => {
    Hostel.find.mockResolvedValue(['h1','h2']);
    const result = await hostelService.getAllHostels();
    expect(Hostel.find).toHaveBeenCalled();
    expect(result).toEqual(['h1','h2']);
  });

  it('assignStudent adds student', async () => {
    const fakeDoc = { students: [], save: jest.fn().mockResolvedValue('ok') };
    Hostel.findById.mockResolvedValue(fakeDoc);
    const result = await hostelService.assignStudent('hid','sid');
    expect(fakeDoc.students).toContain('sid');
    expect(fakeDoc.save).toHaveBeenCalled();
    expect(result).toBe(fakeDoc);
  });
});
