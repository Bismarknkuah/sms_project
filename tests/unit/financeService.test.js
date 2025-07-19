// tests/unit/financeService.test.js
const FinanceTransaction = require('../../src/models/FinanceTransaction');
const financeService = require('../../src/services/financeService');

jest.mock('../../src/models/FinanceTransaction');

describe('financeService', () => {
  afterEach(() => jest.clearAllMocks());

  it('getAllTransactions returns all', async () => {
    const fake = [{ amount: 500 }];
    FinanceTransaction.find.mockResolvedValue(fake);
    const result = await financeService.getAllTransactions();
    expect(FinanceTransaction.find).toHaveBeenCalled();
    expect(result).toBe(fake);
  });

  it('getTransactionById returns one', async () => {
    const fake = { amount: 250 };
    FinanceTransaction.findById.mockResolvedValue(fake);
    const result = await financeService.getTransactionById('tx1');
    expect(FinanceTransaction.findById).toHaveBeenCalledWith('tx1');
    expect(result).toBe(fake);
  });

  it('createTransaction should create', async () => {
    const data = { amount: 123 };
    FinanceTransaction.create.mockResolvedValue(data);
    const result = await financeService.createTransaction(data);
    expect(FinanceTransaction.create).toHaveBeenCalledWith(data);
    expect(result).toBe(data);
  });

  it('deleteTransaction should remove', async () => {
    FinanceTransaction.findByIdAndDelete.mockResolvedValue(true);
    const result = await financeService.deleteTransaction('tx2');
    expect(FinanceTransaction.findByIdAndDelete).toHaveBeenCalledWith('tx2');
    expect(result).toBe(true);
  });
});
