// controllers/chatController.js
// Purpose: REST endpoints for conversation list + message history + starting
// a conversation. Actually SENDING a message happens over Socket.io
// (see socket/index.js) so it can be delivered live; these endpoints handle
// everything else (listing, history, marking read).

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Project = require("../models/Project");

// @route GET /api/chats
const getMyConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [{ client: userId }, { freelancer: userId }],
    })
      .populate("project", "title")
      .populate("client", "name profileImage")
      .populate("freelancer", "name profileImage")
      .sort({ lastMessageAt: -1 });

    const withUnread = conversations.map((c) => {
      const obj = c.toObject();
      obj.unreadForMe = c.unreadCount.get(userId.toString()) || 0;
      return obj;
    });

    res.status(200).json({ conversations: withUnread });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversations", error: error.message });
  }
};

// @route POST /api/chats
const getOrCreateConversation = async (req, res) => {
  try {
    const { projectId, freelancerId } = req.body;

    if (!projectId || !freelancerId) {
      return res.status(400).json({ message: "projectId and freelancerId are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const requesterId = req.user._id.toString();
    const isClient = project.client.toString() === requesterId;
    const isThatFreelancer = freelancerId === requesterId;

    if (!isClient && !isThatFreelancer) {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }

    let conversation = await Conversation.findOne({ project: projectId, freelancer: freelancerId });

    if (!conversation) {
      conversation = await Conversation.create({
        project: projectId,
        client: project.client,
        freelancer: freelancerId,
      });
    }

    conversation = await conversation.populate([
      { path: "project", select: "title" },
      { path: "client", select: "name profileImage" },
      { path: "freelancer", select: "name profileImage" },
    ]);

    res.status(200).json({ conversation });
  } catch (error) {
    res.status(500).json({ message: "Failed to start conversation", error: error.message });
  }
};

// @route GET /api/chats/:conversationId/messages
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userId = req.user._id.toString();
    if (conversation.client.toString() !== userId && conversation.freelancer.toString() !== userId) {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", "name profileImage")
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};

// @route PUT /api/chats/:conversationId/read
const markConversationRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userId = req.user._id.toString();
    if (conversation.client.toString() !== userId && conversation.freelancer.toString() !== userId) {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }

    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    await Message.updateMany(
      { conversation: conversation._id, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark conversation as read", error: error.message });
  }
};

module.exports = { getMyConversations, getOrCreateConversation, getMessages, markConversationRead };
