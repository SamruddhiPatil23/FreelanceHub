// models/User.js
// Purpose: defines the shape of a "User" document in MongoDB.
// One schema handles all 3 roles (client/freelancer/admin) — role-specific
// fields (skills, bio) are simply left empty for roles that don't use them.
// This is the simplest approach for a college project (no schema inheritance needed).

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      default: "client",
    },
    // Freelancer-specific fields
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: "",
    },
    // Client-specific fields
    companyName: {
      type: String,
      default: "",
    },
    // Shared fields
    bio: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "", // stores the filename saved by multer
    },
    isBlocked: {
      type: Boolean,
      default: false, // admin flips this to block a user
    },
    // Populated/recalculated whenever a new review is submitted for this user (Module 6)
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Module 13: verification / moderation workflow
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    verificationNote: {
      type: String,
      default: "", // optional note the user submits with their request
    },
    verificationRejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
