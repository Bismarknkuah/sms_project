// src/routes/communicationRoutes.js
const express = require('express');
const {
  listConversations,
  getConversation,
  sendMessage
} = require('../controllers/communicationController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.get('/', listConversations);
router.get('/:id', getConversation);
router.post('/:id/send', sendMessage);

module.exports = router;
