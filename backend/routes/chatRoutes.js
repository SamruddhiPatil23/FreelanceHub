// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const {
  getMyConversations,
  getOrCreateConversation,
  getMessages,
  markConversationRead,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyConversations);
router.post("/", protect, getOrCreateConversation);
router.get("/:conversationId/messages", protect, getMessages);
router.put("/:conversationId/read", protect, markConversationRead);

module.exports = router;
