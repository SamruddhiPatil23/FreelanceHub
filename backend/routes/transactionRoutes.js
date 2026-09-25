// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const {
  getMyTransactions,
  markAsPaid,
  getAllTransactions,
  updateTransactionStatus,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get("/my", protect, getMyTransactions);
router.put("/:id/mark-paid", protect, authorizeRoles("client"), markAsPaid);
router.get("/", protect, authorizeRoles("admin"), getAllTransactions);
router.put("/:id/status", protect, authorizeRoles("admin"), updateTransactionStatus);

module.exports = router;
