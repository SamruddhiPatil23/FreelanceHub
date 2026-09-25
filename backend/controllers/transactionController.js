// controllers/transactionController.js
// Purpose: payment TRACKING only — no gateway. A client can mark their own
// transaction as paid (simulating an off-platform payment); admin can review
// and adjust the status of any transaction.

const Transaction = require("../models/Transaction");

// @route GET /api/transactions/my
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ client: req.user._id }, { freelancer: req.user._id }],
    })
      .populate("project", "title")
      .populate("client", "name")
      .populate("freelancer", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

// @route PUT /api/transactions/:id/mark-paid   (client, owner only)
const markAsPaid = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    if (transaction.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own transactions" });
    }
    if (transaction.status === "paid") {
      return res.status(400).json({ message: "This transaction is already marked paid" });
    }

    transaction.status = "paid";
    await transaction.save();

    res.status(200).json({ transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to update transaction", error: error.message });
  }
};

// @route GET /api/transactions   (admin)
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("project", "title")
      .populate("client", "name email")
      .populate("freelancer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

// @route PUT /api/transactions/:id/status   (admin) — manual override
const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "paid", "failed", "refunded"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    transaction.status = status;
    await transaction.save();

    res.status(200).json({ transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to update transaction", error: error.message });
  }
};

module.exports = { getMyTransactions, markAsPaid, getAllTransactions, updateTransactionStatus };
