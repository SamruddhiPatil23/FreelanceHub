// controllers/projectController.js
// Purpose: all business logic for posting, browsing, editing, and deleting projects.

const Project = require("../models/Project");
const notify = require("../utils/notify"); // Module 12

// @route POST /api/projects   (client only)
const createProject = async (req, res) => {
  try {
    const { title, description, budget, category, skillsRequired } = req.body;

    if (!title || !description || !budget || !category) {
      return res.status(400).json({
        message: "Title, description, budget and category are all required",
      });
    }

    const project = await Project.create({
      title,
      description,
      budget,
      category,
      skillsRequired: skillsRequired || [],
      client: req.user._id,
    });

    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ message: "Failed to create project", error: error.message });
  }
};

// @route GET /api/projects
// Purpose: freelancer "browse projects" — only OPEN projects, with optional
// ?category= and ?search= (matches title/description) query filters.
const getProjects = async (req, res) => {
  try {
    const { category, search } = req.query;

    const filter = { status: "open" };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(filter)
      .populate("client", "name companyName")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
};

// @route GET /api/projects/my   (client only)
// Purpose: client's own dashboard list — ALL their projects regardless of status.
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your projects", error: error.message });
  }
};

// @route GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client", "name companyName email")
      .populate("selectedFreelancer", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project", error: error.message });
  }
};

// @route PUT /api/projects/:id   (client, owner only)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Ownership check: a client can only edit THEIR OWN project
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own projects" });
    }

    const { title, description, budget, category, skillsRequired, status } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (budget !== undefined) project.budget = budget;
    if (category !== undefined) project.category = category;
    if (skillsRequired !== undefined) project.skillsRequired = skillsRequired;
    if (status !== undefined) project.status = status;

    const updatedProject = await project.save();
    res.status(200).json({ project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: "Failed to update project", error: error.message });
  }
};

// @route DELETE /api/projects/:id   (client, owner only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own projects" });
    }

    await project.deleteOne();
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project", error: error.message });
  }
};

// @route PUT /api/projects/:id/complete   (client, owner only) — Module 8
// Purpose: client marks an in-progress project as completed, which is the
// gate that unlocks reviews for both sides (see reviewController).
const markProjectCompleted = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only complete your own projects" });
    }

    if (project.status !== "in-progress") {
      return res
        .status(400)
        .json({ message: "Only an in-progress project can be marked completed" });
    }

    project.status = "completed";
    await project.save();

    // Module 12: notify the freelancer the project is done (unlocks reviews)
    if (project.selectedFreelancer) {
      await notify({
        userId: project.selectedFreelancer,
        type: "project_completed",
        message: `"${project.title}" was marked as completed. You can now leave a review.`,
        relatedProject: project._id,
      });
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark project completed", error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  markProjectCompleted,
};
