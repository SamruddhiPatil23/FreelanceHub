// controllers/reviewController.js
// Purpose: submitting reviews (either direction) after a project is completed,
// and reading a user's review history + average rating.

const Review = require("../models/Review");
const Project = require("../models/Project");
const User = require("../models/User");
const notify = require("../utils/notify"); // Module 12

// Recalculates and saves a user's averageRating + totalReviews.
// Called every time a new review is created for them.
const recalculateRating = async (userId) => {
  const reviews = await Review.find({ reviewee: userId });
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  await User.findByIdAndUpdate(userId, {
    averageRating: Math.round(averageRating * 10) / 10, // one decimal place
    totalReviews,
  });
};

// @route POST /api/reviews
// Purpose: either the client or the selected freelancer on a COMPLETED project
// can review the other party — exactly once each.
const createReview = async (req, res) => {
  try {
    const { projectId, rating, comment } = req.body;

    if (!projectId || !rating || !comment) {
      return res
        .status(400)
        .json({ message: "Project, rating and comment are all required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status !== "completed") {
      return res
        .status(400)
        .json({ message: "You can only leave a review after the project is marked completed" });
    }

    const reviewerId = req.user._id.toString();
    const clientId = project.client.toString();
    const freelancerId = project.selectedFreelancer?.toString();

    let revieweeId;
    if (reviewerId === clientId) {
      revieweeId = freelancerId;
    } else if (reviewerId === freelancerId) {
      revieweeId = clientId;
    } else {
      return res
        .status(403)
        .json({ message: "You were not involved in this project" });
    }

    const review = await Review.create({
      project: projectId,
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment,
    });

    await recalculateRating(revieweeId);

    // Module 12: notify the person who was reviewed
    await notify({
      userId: revieweeId,
      type: "review_received",
      message: `${req.user.name} left you a ${rating}-star review`,
      relatedProject: project._id,
    });

    res.status(201).json({ review });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this project" });
    }
    res.status(500).json({ message: "Failed to submit review", error: error.message });
  }
};

// @route GET /api/reviews/user/:userId
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name role profileImage")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    const user = await User.findById(req.params.userId).select(
      "averageRating totalReviews name"
    );

    res.status(200).json({
      reviews,
      averageRating: user?.averageRating || 0,
      totalReviews: user?.totalReviews || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

// @route GET /api/reviews/project/:projectId
const getProjectReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ project: req.params.projectId }).populate(
      "reviewer",
      "name role profileImage"
    );
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project reviews", error: error.message });
  }
};

module.exports = { createReview, getUserReviews, getProjectReviews };
