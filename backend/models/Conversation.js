// models/Conversation.js
// Purpose: a chat "room" between a project's client and one freelancer.
// Keyed by (project, freelancer) — the client is always project.client, so
// it doesn't need its own field. Tracking unreadCount here (rather than
// counting unread messages on every load) makes the navbar badge cheap to read.

const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // Unread count PER USER, keyed by their string id — simplest way to
    // track "unread for me" without a separate read-receipts table.
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// One conversation per project+freelancer pair — reopening chat with the
// same freelancer on the same project reuses it instead of duplicating.
conversationSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
