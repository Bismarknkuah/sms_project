const communicationService = require('../services/communicationService');

/**
 * GET /api/communication
 */
async function listConversations(req, res, next) {
  try {
    const list = await communicationService.listConversations();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/communication/:id
 */
async function getConversation(req, res, next) {
  try {
    const conv = await communicationService.getConversation(req.params.id);
    res.json(conv);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/communication/:id/send
 */
async function sendMessage(req, res, next) {
  try {
    const msg = await communicationService.sendMessage(
      req.params.id,
      req.user.username || 'Unknown',
      req.body.text
    );
    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listConversations,
  getConversation,
  sendMessage
};
