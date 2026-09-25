// routes/projectRoutes.js
// IMPORTANT: "/my" is defined BEFORE "/:id" — otherwise Express would treat
// the literal word "my" as an :id value and send it to getProjectById instead.

const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  markProjectCompleted,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("client"), createProject);
router.get("/", protect, getProjects);
router.get("/my", protect, authorizeRoles("client"), getMyProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, authorizeRoles("client"), updateProject);
router.put("/:id/complete", protect, authorizeRoles("client"), markProjectCompleted); // Module 8
router.delete("/:id", protect, authorizeRoles("client"), deleteProject);

module.exports = router;
