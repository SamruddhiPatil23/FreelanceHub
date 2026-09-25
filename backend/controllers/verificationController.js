// controllers/verificationController.js
// Purpose: the moderation workflow — a user requests verification (e.g. to
// earn a trust badge), and an admin approves or rejects that request.

const User = require("../models/User");

// @route POST /api/verification/request   (any logged-in user)
const requestVerification = async (req, res) => {
  try {
    const { note } = req.body;

    if (req.user.verificationStatus === "verified") {
      return res.status(400).json({ message: "You are already verified" });
    }
    if (req.user.verificationStatus === "pending") {
      return res.status(400).json({ message: "Your verification request is already pending" });
    }

    req.user.verificationStatus = "pending";
    req.user.verificationNote = note || "";
    req.user.verificationRejectionReason = "";
    await req.user.save();

    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit verification request", error: error.message });
  }
};

// @route GET /api/verification/pending   (admin)
const getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: "pending" }).select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending verifications", error: error.message });
  }
};

// @route PUT /api/verification/:userId/approve   (admin)
const approveVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verificationStatus = "verified";
    user.verificationRejectionReason = "";
    await user.save();

    res.status(200).json({ message: `${user.name} is now verified`, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve verification", error: error.message });
  }
};

// @route PUT /api/verification/:userId/reject   (admin)
const rejectVerification = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verificationStatus = "rejected";
    user.verificationRejectionReason = reason || "Did not meet verification requirements";
    await user.save();

    res.status(200).json({ message: `${user.name}'s request was rejected`, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject verification", error: error.message });
  }
};

module.exports = {
  requestVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
};
