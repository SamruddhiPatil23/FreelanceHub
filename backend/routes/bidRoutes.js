// routes/bidRoutes.js
// "/my" is defined before "/project/:projectId" pattern-wise they don't
// collide (different prefixes), but keep this order for consistency.

const express = require("express");
const router = express.Router();
const {
  submitBid,
  getBidsForProject,
  getMyBids,
  shortlistBid,
  acceptBid,
} = require("../controllers/bidController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("freelancer"), submitBid);
router.get("/my", protect, authorizeRoles("freelancer"), getMyBids);
router.get("/project/:projectId", protect, authorizeRoles("client"), getBidsForProject);
router.put("/:id/shortlist", protect, authorizeRoles("client"), shortlistBid);
router.put("/:id/accept", protect, authorizeRoles("client"), acceptBid);

module.exports = router;
