// tests/unit/staffService.test.js
const Staff = require('../../src/models/Staff');
const staffService = require('../../src/services/staffService');

jest.mock('../../src/models/Staff');

describe('staffService', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllStaff should return all staff', async () => {
    const fake = [{ name: 'Eve' }];
    Staff.find.mockResolvedValue(fake);
    const result = await staffService.getAllStaff();
    expect(Staff.find).toHaveBeenCalled();
    expect(result).toBe(fake);
  });

  it('getStaffById should return one staff', async () => {
    const fake = { name: 'Frank' };
    Staff.findById.mockResolvedValue(fake);
    const result = await staffService.getStaffById('sid');
    expect(Staff.findById).toHaveBeenCalledWith('sid');
    expect(result).toBe(fake);
  });

  it('createStaff should create staff', async () => {
    const data = { name: 'Grace' };
    Staff.create.mockResolvedValue(data);
    const result = await staffService.createStaff(data);
    expect(Staff.create).toHaveBeenCalledWith(data);
    expect(result).toBe(data);
  });

  it('updateStaff should update and return new doc', async () => {
    const updated = { name: 'Heidi' };
    Staff.findByIdAndUpdate.mockResolvedValue(updated);
    const result = await staffService.updateStaff('sid2', { name: 'Heidi' });
    expect(Staff.findByIdAndUpdate).toHaveBeenCalledWith('sid2', { name: 'Heidi' }, { new: true });
    expect(result).toBe(updated);
  });

  it('deleteStaff should delete staff', async () => {
    Staff.findByIdAndDelete.mockResolvedValue(true);
    const result = await staffService.deleteStaff('sid3');
    expect(Staff.findByIdAndDelete).toHaveBeenCalledWith('sid3');
    expect(result).toBe(true);
  });
});
