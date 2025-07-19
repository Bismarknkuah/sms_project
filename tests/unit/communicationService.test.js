// tests/unit/communicationService.test.js
const Message = require('../../src/models/Message');
const communicationService = require('../../src/services/communicationService');

jest.mock('../../src/models/Message');

describe('communicationService', () => {
  afterEach(() => jest.clearAllMocks());

  it('listConversations lists distinct IDs', async () => {
    Message.distinct.mockResolvedValue(['c1','c2']);
    const result = await communicationService.listConversations();
    expect(Message.distinct).toHaveBeenCalledWith('conversationId');
    expect(result).toEqual([{ _id: 'c1', name: 'Conversation c1' }, { _id: 'c2', name: 'Conversation c2' }]);
  });

  it('getConversation returns messages sorted', async () => {
    const msgs = [{ text:'a', time:1 }, { text:'b', time:2 }];
    Message.find.mockReturnValue({ sort: () => Promise.resolve(msgs) });
    const result = await communicationService.getConversation('c1');
    expect(Message.find).toHaveBeenCalledWith({ conversationId: 'c1' });
    expect(result.messages).toBe(msgs);
  });

  it('sendMessage saves new Message', async () => {
    const saveMock = jest.fn().mockResolvedValue({ text:'hi' });
    Message.mockImplementation(() => ({ save: saveMock }));
    const result = await communicationService.sendMessage('c1','You','hi');
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual({ text:'hi' });
  });
});
