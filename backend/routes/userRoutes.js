// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All routes here require a valid JWT (protect runs first on every route)
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.post("/me/upload", protect, upload.single("profileImage"), uploadProfileImage);

module.exports = router;
