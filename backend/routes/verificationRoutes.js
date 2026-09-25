// routes/verificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  requestVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} = require("../controllers/verificationController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/request", protect, requestVerification);
router.get("/pending", protect, authorizeRoles("admin"), getPendingVerifications);
router.put("/:userId/approve", protect, authorizeRoles("admin"), approveVerification);
router.put("/:userId/reject", protect, authorizeRoles("admin"), rejectVerification);

module.exports = router;
