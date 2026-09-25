// routes/disputeRoutes.js
const express = require("express");
const router = express.Router();
const {
  raiseDispute,
  getDisputeForProject,
  getAllDisputes,
  resolveDispute,
} = require("../controllers/disputeController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, raiseDispute);
router.get("/", protect, authorizeRoles("admin"), getAllDisputes);
router.get("/project/:projectId", protect, getDisputeForProject);
router.put("/:id/resolve", protect, authorizeRoles("admin"), resolveDispute);

module.exports = router;
