const Message = require('../models/Message');

/**
 * List all conversation threads.
 * Returns [{ _id, name }]
 */
async function listConversations() {
  const ids = await Message.distinct('conversationId');
  return ids.map(id => ({ _id: id, name: `Conversation ${id}` }));
}

/**
 * Fetch one conversation (all messages) by thread ID.
 * Returns { id, messages: [...] }
 */
async function getConversation(id) {
  const messages = await Message.find({ conversationId: id }).sort('time');
  return { id, messages };
}

/**
 * Send a new message into a conversation.
 */
async function sendMessage(conversationId, sender, text) {
  const msg = new Message({ conversationId, sender, text, time: new Date() });
  return msg.save();
}

module.exports = {
  listConversations,
  getConversation,
  sendMessage
};
