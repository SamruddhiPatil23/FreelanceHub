// routes/adminRoutes.js
// Every route here requires BOTH a valid JWT (protect) AND role === "admin"
// (authorizeRoles) — a client or freelancer token gets a 403 on all of these.

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllProjects,
  adminDeleteProject,
  getAnalytics,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);
router.get("/projects", protect, authorizeRoles("admin"), getAllProjects);
router.delete("/projects/:id", protect, authorizeRoles("admin"), adminDeleteProject);
router.get("/analytics", protect, authorizeRoles("admin"), getAnalytics);

module.exports = router;
