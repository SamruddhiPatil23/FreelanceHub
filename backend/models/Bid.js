// models/Bid.js
// Purpose: a freelancer's proposal on a specific project.

const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Bid amount is required"],
      min: [1, "Bid amount must be greater than 0"],
    },
    message: {
      type: String,
      required: [true, "A short proposal message is required"],
    },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// A freelancer can only submit ONE bid per project — enforced at the DB level.
bidSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model("Bid", bidSchema);
