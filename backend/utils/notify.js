// utils/notify.js
// Purpose: single helper used by other controllers (bids, projects, reviews)
// to create a notification AND push it to the user in real time if they're
// connected — avoids repeating "create doc + emit socket event" everywhere.

const Notification = require("../models/Notification");
const { getIO } = require("../socket");

const notify = async ({ userId, type, message, relatedProject = null }) => {
  const notification = await Notification.create({
    user: userId,
    type,
    message,
    relatedProject,
  });

  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit("newNotification", notification);
  }

  return notification;
};

module.exports = notify;
