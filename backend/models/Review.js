// models/Review.js
// Purpose: a review left by one party (client or freelancer) about the other,
// tied to one specific completed project.

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "A comment is required"],
    },
  },
  { timestamps: true }
);

// Each side of a project can leave only ONE review of the other party.
reviewSchema.index({ project: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
