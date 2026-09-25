// controllers/bidController.js
// Purpose: all business logic for submitting proposals and for clients
// reviewing/shortlisting/accepting them.

const Bid = require("../models/Bid");
const Project = require("../models/Project");
const Transaction = require("../models/Transaction"); // Module 15
const notify = require("../utils/notify"); // Module 12

// @route POST /api/bids   (freelancer only)
const submitBid = async (req, res) => {
  try {
    const { projectId, amount, message } = req.body;

    if (!projectId || !amount || !message) {
      return res
        .status(400)
        .json({ message: "Project, amount and message are all required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status !== "open") {
      return res
        .status(400)
        .json({ message: "This project is no longer accepting proposals" });
    }

    const bid = await Bid.create({
      project: projectId,
      freelancer: req.user._id,
      amount,
      message,
    });

    // Module 12: notify the client that a new bid came in
    await notify({
      userId: project.client,
      type: "new_bid",
      message: `${req.user.name} submitted a proposal on "${project.title}"`,
      relatedProject: project._id,
    });

    res.status(201).json({ bid });
  } catch (error) {
    // Mongo duplicate-key error (11000) fires when the unique index
    // (project + freelancer) is violated — i.e. they already bid on this one.
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already submitted a proposal for this project" });
    }
    res.status(500).json({ message: "Failed to submit proposal", error: error.message });
  }
};

// @route GET /api/bids/project/:projectId   (client, owner only)
const getBidsForProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only view proposals for your own projects" });
    }

    const bids = await Bid.find({ project: req.params.projectId })
      .populate("freelancer", "name email skills experience profileImage verificationStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({ bids });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch proposals", error: error.message });
  }
};

// @route GET /api/bids/my   (freelancer only)
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user._id })
      .populate("project", "title budget status category")
      .sort({ createdAt: -1 });

    res.status(200).json({ bids });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your proposals", error: error.message });
  }
};

// @route PUT /api/bids/:id/shortlist   (client, project owner only)
const shortlistBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate("project");
    if (!bid) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    if (bid.project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only manage proposals on your own projects" });
    }

    bid.status = "shortlisted";
    await bid.save();

    res.status(200).json({ bid });
  } catch (error) {
    res.status(500).json({ message: "Failed to shortlist proposal", error: error.message });
  }
};

// @route PUT /api/bids/:id/accept   (client, project owner only)
// Purpose: accepting a bid is a multi-step operation:
//   1. mark this bid as "accepted"
//   2. mark every OTHER bid on the same project as "rejected"
//   3. mark the project as "in-progress" and set selectedFreelancer
const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate("project");
    if (!bid) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const project = bid.project;

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only manage proposals on your own projects" });
    }

    if (project.status !== "open") {
      return res
        .status(400)
        .json({ message: "This project already has an accepted proposal" });
    }

    bid.status = "accepted";
    await bid.save();

    await Bid.updateMany(
      { project: project._id, _id: { $ne: bid._id } },
      { status: "rejected" }
    );

    project.status = "in-progress";
    project.selectedFreelancer = bid.freelancer;
    await project.save();

    // Module 12: notify the freelancer their bid was accepted
    await notify({
      userId: bid.freelancer,
      type: "bid_accepted",
      message: `Your proposal on "${project.title}" was accepted!`,
      relatedProject: project._id,
    });

    // Module 15: create a payment-tracking record for this engagement
    await Transaction.create({
      project: project._id,
      client: project.client,
      freelancer: bid.freelancer,
      amount: bid.amount,
      status: "pending",
    });

    res.status(200).json({ bid, project });
  } catch (error) {
    res.status(500).json({ message: "Failed to accept proposal", error: error.message });
  }
};

module.exports = { submitBid, getBidsForProject, getMyBids, shortlistBid, acceptBid };
