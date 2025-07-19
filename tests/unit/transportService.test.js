// tests/unit/transportService.test.js
const Transport = require('../../src/models/Transport');
const transportService = require('../../src/services/transportService');

jest.mock('../../src/models/Transport');

describe('transportService', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllRoutes returns routes', async () => {
    Transport.find.mockResolvedValue(['r1']);
    const result = await transportService.getAllRoutes();
    expect(Transport.find).toHaveBeenCalled();
    expect(result).toEqual(['r1']);
  });

  it('deleteRoute deletes route', async () => {
    Transport.findByIdAndDelete.mockResolvedValue(true);
    const result = await transportService.deleteRoute('rid');
    expect(Transport.findByIdAndDelete).toHaveBeenCalledWith('rid');
    expect(result).toBe(true);
  });
});
