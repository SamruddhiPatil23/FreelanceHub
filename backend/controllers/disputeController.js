// controllers/disputeController.js
// Purpose: either party on a project (client or the selected freelancer) can
// raise a dispute once work is underway; admin reviews and resolves it.

const Dispute = require("../models/Dispute");
const Project = require("../models/Project");

// @route POST /api/disputes
const raiseDispute = async (req, res) => {
  try {
    const { projectId, reason } = req.body;

    if (!projectId || !reason) {
      return res.status(400).json({ message: "projectId and reason are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status === "open") {
      return res
        .status(400)
        .json({ message: "A dispute can only be raised once a freelancer is assigned" });
    }

    const requesterId = req.user._id.toString();
    const clientId = project.client.toString();
    const freelancerId = project.selectedFreelancer?.toString();

    let against;
    if (requesterId === clientId) {
      against = freelancerId;
    } else if (requesterId === freelancerId) {
      against = clientId;
    } else {
      return res.status(403).json({ message: "You were not involved in this project" });
    }

    const existingOpen = await Dispute.findOne({
      project: projectId,
      status: { $in: ["open", "under_review"] },
    });
    if (existingOpen) {
      return res
        .status(400)
        .json({ message: "There is already an open dispute for this project" });
    }

    const dispute = await Dispute.create({
      project: projectId,
      raisedBy: req.user._id,
      against,
      reason,
    });

    res.status(201).json({ dispute });
  } catch (error) {
    res.status(500).json({ message: "Failed to raise dispute", error: error.message });
  }
};

// @route GET /api/disputes/project/:projectId
const getDisputeForProject = async (req, res) => {
  try {
    const dispute = await Dispute.findOne({ project: req.params.projectId })
      .populate("raisedBy", "name role")
      .populate("against", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({ dispute: dispute || null });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dispute", error: error.message });
  }
};

// @route GET /api/disputes   (admin)
const getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("project", "title")
      .populate("raisedBy", "name role")
      .populate("against", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({ disputes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch disputes", error: error.message });
  }
};

// @route PUT /api/disputes/:id/resolve   (admin)
const resolveDispute = async (req, res) => {
  try {
    const { resolutionNote, outcome } = req.body;

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    dispute.status = outcome === "rejected" ? "rejected" : "resolved";
    dispute.resolutionNote = resolutionNote || "";
    await dispute.save();

    res.status(200).json({ dispute });
  } catch (error) {
    res.status(500).json({ message: "Failed to resolve dispute", error: error.message });
  }
};

module.exports = { raiseDispute, getDisputeForProject, getAllDisputes, resolveDispute };
