// controllers/adminController.js
// Purpose: everything the admin role needs — user management, project
// moderation (bypassing normal ownership checks), and platform analytics.

const User = require("../models/User");
const Project = require("../models/Project");
const Bid = require("../models/Bid");

// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// @route DELETE /api/admin/users/:id
// Purpose: removes a user AND cascades cleanup so no orphaned data is left
// behind — deleting a client removes their projects (and bids on those
// projects); deleting a freelancer removes their bids.
const deleteUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    if (targetUser.role === "client") {
      const clientProjects = await Project.find({ client: targetUser._id });
      const projectIds = clientProjects.map((p) => p._id);
      await Bid.deleteMany({ project: { $in: projectIds } });
      await Project.deleteMany({ client: targetUser._id });
    }

    if (targetUser.role === "freelancer") {
      await Bid.deleteMany({ freelancer: targetUser._id });
    }

    await targetUser.deleteOne();

    res.status(200).json({ message: "User and related data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// @route GET /api/admin/projects
// Purpose: ALL projects regardless of status — unlike the freelancer's
// browse endpoint, which only shows "open" ones.
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("client", "name email companyName")
      .sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
};

// @route DELETE /api/admin/projects/:id
// Purpose: admin can delete ANY project (no ownership check, unlike the
// client's own delete endpoint) — used for moderation/disputes.
const adminDeleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Bid.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
};

// @route GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalClients, totalFreelancers, totalProjects, totalBids] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "client" }),
        User.countDocuments({ role: "freelancer" }),
        Project.countDocuments(),
        Bid.countDocuments(),
      ]);

    const openProjects = await Project.countDocuments({ status: "open" });
    const inProgressProjects = await Project.countDocuments({ status: "in-progress" });
    const completedProjects = await Project.countDocuments({ status: "completed" });

    res.status(200).json({
      totalUsers,
      totalClients,
      totalFreelancers,
      totalProjects,
      totalBids,
      openProjects,
      inProgressProjects,
      completedProjects,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getAllProjects,
  adminDeleteProject,
  getAnalytics,
};
