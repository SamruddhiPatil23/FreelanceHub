// socket/index.js
// Purpose: sets up Socket.io on top of the existing HTTP server. Handles:
//  - authenticating the socket connection using the same JWT as the REST API
//  - joining a personal room ("user:<id>") so other modules (notifications)
//    can push events straight to one user
//  - joining/leaving project-specific chat rooms ("conversation:<id>")
//  - real-time message send/receive, with unread-count + read-receipt updates
//
// Other backend modules (notifications, in Module 12) import getIO() from
// here to emit events without needing a circular import of server.js.

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

let ioInstance = null;

const getIO = () => ioInstance;

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on("joinConversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant =
          conversation.client.toString() === socket.userId ||
          conversation.freelancer.toString() === socket.userId;

        if (isParticipant) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (error) {
        // ignore bad ids
      }
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("sendMessage", async ({ conversationId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant =
          conversation.client.toString() === socket.userId ||
          conversation.freelancer.toString() === socket.userId;
        if (!isParticipant) return;

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text: text.trim(),
        });
        await message.populate("sender", "name profileImage");

        const otherUserId =
          conversation.client.toString() === socket.userId
            ? conversation.freelancer.toString()
            : conversation.client.toString();

        conversation.lastMessage = text.trim();
        conversation.lastMessageAt = new Date();
        const currentUnread = conversation.unreadCount.get(otherUserId) || 0;
        conversation.unreadCount.set(otherUserId, currentUnread + 1);
        await conversation.save();

        io.to(`conversation:${conversationId}`).emit("newMessage", message);

        io.to(`user:${otherUserId}`).emit("conversationUpdated", {
          conversationId,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt,
          unreadForMe: currentUnread + 1,
        });
      } catch (error) {
        socket.emit("chatError", { message: "Failed to send message" });
      }
    });

    socket.on("markRead", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        conversation.unreadCount.set(socket.userId, 0);
        await conversation.save();

        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: socket.userId }, isRead: false },
          { isRead: true }
        );

        io.to(`conversation:${conversationId}`).emit("conversationRead", {
          conversationId,
          readBy: socket.userId,
        });
      } catch (error) {
        // non-critical
      }
    });
  });

  ioInstance = io;
  return io;
};

module.exports = { initializeSocket, getIO };
