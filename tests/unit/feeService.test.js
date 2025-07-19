// tests/unit/feeService.test.js
const Fee = require('../../src/models/Fee');
const feeService = require('../../src/services/feeService');

jest.mock('../../src/models/Fee');

describe('feeService', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllFees returns all records', async () => {
    const fake = [{ amount: 100 }];
    Fee.find.mockResolvedValue(fake);
    const result = await feeService.getAllFees();
    expect(Fee.find).toHaveBeenCalled();
    expect(result).toBe(fake);
  });

  it('deleteFee deletes record', async () => {
    Fee.findByIdAndDelete.mockResolvedValue(true);
    const result = await feeService.deleteFee('fid');
    expect(Fee.findByIdAndDelete).toHaveBeenCalledWith('fid');
    expect(result).toBe(true);
  });
});
