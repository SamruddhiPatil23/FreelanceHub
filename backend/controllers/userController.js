// controllers/userController.js
// Purpose: profile read/update + profile picture upload.
// getMyProfile was added in Module 1 just to prove JWT protection worked;
// updateMyProfile and uploadProfileImage are the real Module 3 logic.

const User = require("../models/User");

// @route GET /api/users/me
const getMyProfile = async (req, res) => {
  // req.user was attached by authMiddleware after verifying the JWT
  res.status(200).json({ user: req.user });
};

// @route PUT /api/users/me
// Purpose: update the fields relevant to the logged-in user's role.
// We deliberately do NOT allow email/password/role changes here —
// those need separate, more careful flows and are out of scope.
const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, bio, companyName, skills, experience } = req.body;

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;

    // Client-specific field
    if (user.role === "client" && companyName !== undefined) {
      user.companyName = companyName;
    }

    // Freelancer-specific fields
    if (user.role === "freelancer") {
      if (skills !== undefined) {
        // skills arrives as an array from the frontend already split/trimmed
        user.skills = Array.isArray(skills) ? skills : [];
      }
      if (experience !== undefined) user.experience = experience;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        companyName: updatedUser.companyName,
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// @route POST /api/users/me/upload
// Purpose: save the uploaded profile image's filename against the user.
// The actual file-saving-to-disk work already happened in uploadMiddleware (Multer)
// before this controller runs — req.file is populated by then.
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const user = await User.findById(req.user._id);
    user.profileImage = req.file.filename;
    await user.save();

    res.status(200).json({
      message: "Profile image uploaded",
      profileImage: user.profileImage, // frontend builds full URL: /uploads/<filename>
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload image", error: error.message });
  }
};

module.exports = { getMyProfile, updateMyProfile, uploadProfileImage };
