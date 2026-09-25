// pages/ProjectDetail.jsx
// Purpose: single project view — bidding (Module 5), completion workflow
// (Module 8: client marks in-progress -> completed), and reviews (Module 6:
// both sides can review each other once completed, one review each).

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchProjectById,
  clearCurrentProject,
  markProjectCompleted,
} from "../features/projects/projectSlice";
import { submitBid, fetchBidsForProject, clearProjectBids } from "../features/bids/bidSlice";
import {
  submitReview,
  fetchProjectReviews,
  clearProjectReviews,
} from "../features/reviews/reviewSlice";
import { getOrCreateConversation } from "../features/chat/chatSlice";
import { raiseDispute, fetchDisputeForProject, clearCurrentDispute } from "../features/disputes/disputeSlice";
import BidCard from "../components/BidCard";
import StarRating from "../components/StarRating";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const statusLabel = {
  open: "Open",
  "in-progress": "In Progress",
  completed: "Completed",
};

const ProjectDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject, isLoading } = useSelector((state) => state.projects);
  const { projectBids, isSubmitting: isSubmittingBid } = useSelector((state) => state.bids);
  const { projectReviews, isSubmitting: isSubmittingReview } = useSelector(
    (state) => state.reviews
  );
  const { currentDispute } = useSelector((state) => state.disputes);
  const { user } = useSelector((state) => state.auth);

  const [showBidForm, setShowBidForm] = useState(false);
  const [bidForm, setBidForm] = useState({ amount: "", message: "" });
  const [bidErrors, setBidErrors] = useState({});
  const [hasBidSubmitted, setHasBidSubmitted] = useState(false);

  const [isCompleting, setIsCompleting] = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [reviewError, setReviewError] = useState("");

  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchProjectReviews(id));
    return () => {
      dispatch(clearCurrentProject());
      dispatch(clearProjectBids());
      dispatch(clearProjectReviews());
      dispatch(clearCurrentDispute());
    };
  }, [id, dispatch]);

  const isOwner =
    user?.role === "client" && currentProject?.client?._id === user._id;

  const isSelectedFreelancer =
    user?.role === "freelancer" &&
    currentProject?.selectedFreelancer?._id === user._id;

  useEffect(() => {
    if (isOwner) {
      dispatch(fetchBidsForProject(id));
    }
  }, [isOwner, id, dispatch]);

  // Module 14: load any existing dispute once a freelancer is assigned
  useEffect(() => {
    if (currentProject && currentProject.status !== "open") {
      dispatch(fetchDisputeForProject(id));
    }
  }, [currentProject?.status, id, dispatch]);

  // Module 11: freelancer messaging the client directly from the project page
  const handleMessageClient = async () => {
    const result = await dispatch(
      getOrCreateConversation({ projectId: id, freelancerId: user._id })
    );
    if (result.meta.requestStatus === "fulfilled") {
      navigate(`/messages/${result.payload._id}`);
    } else {
      toast.error(result.payload || "Could not start conversation");
    }
  };

  // Module 14: raise a dispute
  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    if (disputeReason.trim().length < 10) {
      toast.error("Please describe the issue in at least 10 characters");
      return;
    }
    const result = await dispatch(raiseDispute({ projectId: id, reason: disputeReason }));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Dispute raised — an admin will review it");
      setShowDisputeForm(false);
      setDisputeReason("");
    } else {
      toast.error(result.payload || "Could not raise dispute");
    }
  };

  const validateBid = () => {
    const errs = {};
    if (!bidForm.amount || Number(bidForm.amount) <= 0)
      errs.amount = "Enter an amount greater than 0";
    if (bidForm.message.trim().length < 15)
      errs.message = "Add a short message (at least 15 characters)";
    setBidErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    if (!validateBid()) return;

    const result = await dispatch(
      submitBid({ projectId: id, amount: Number(bidForm.amount), message: bidForm.message })
    );

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Proposal submitted!");
      setShowBidForm(false);
      setHasBidSubmitted(true);
    } else {
      toast.error(result.payload || "Could not submit proposal");
      if (result.payload?.toLowerCase().includes("already submitted")) {
        setHasBidSubmitted(true);
        setShowBidForm(false);
      }
    }
  };

  const handleMarkCompleted = async () => {
    setIsCompleting(true);
    const result = await dispatch(markProjectCompleted(id));
    setIsCompleting(false);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Project marked as completed — you can now leave a review");
    } else {
      toast.error(result.payload || "Could not mark project completed");
    }
  };

  const myReview = projectReviews.find((r) => r.reviewer?._id === user?._id);
  const canReview =
    currentProject?.status === "completed" && (isOwner || isSelectedFreelancer) && !myReview;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) {
      setReviewError("Please select a star rating");
      return;
    }
    if (reviewForm.comment.trim().length < 10) {
      setReviewError("Comment must be at least 10 characters");
      return;
    }
    setReviewError("");

    const result = await dispatch(
      submitReview({ projectId: id, rating: reviewForm.rating, comment: reviewForm.comment })
    );

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Review submitted — thank you!");
      setReviewForm({ rating: 0, comment: "" });
    } else {
      toast.error(result.payload || "Could not submit review");
    }
  };

  if (isLoading || !currentProject) {
    return (
      <div className="container py-5">
        <LoadingSpinner label="Loading project..." />
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <button className="btn btn-fh-outline btn-sm px-3 mb-4" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div
        className="bg-white p-4 p-md-5 mb-4"
        style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
      >
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <h3 className="fh-display mb-1">{currentProject.title}</h3>
            <p className="fh-muted mb-0" style={{ fontSize: "0.9rem" }}>
              {currentProject.category} · Posted by{" "}
              {currentProject.client?.companyName || currentProject.client?.name} ·{" "}
              {new Date(currentProject.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className="badge rounded-pill px-3 py-2"
            style={{
              backgroundColor:
                currentProject.status === "completed"
                  ? "rgba(47,158,104,0.12)"
                  : currentProject.status === "in-progress"
                  ? "rgba(22,33,62,0.08)"
                  : "rgba(232,163,61,0.15)",
              color:
                currentProject.status === "completed"
                  ? "var(--fh-success)"
                  : currentProject.status === "in-progress"
                  ? "var(--fh-navy)"
                  : "var(--fh-amber-dark)",
              fontWeight: 600,
              fontSize: "0.8rem",
            }}
          >
            {statusLabel[currentProject.status]}
          </span>
        </div>

        <p style={{ whiteSpace: "pre-wrap" }}>{currentProject.description}</p>

        <div className="d-flex flex-wrap gap-2 mb-4">
          {(currentProject.skillsRequired || []).map((skill) => (
            <span
              key={skill}
              className="badge rounded-pill"
              style={{
                backgroundColor: "#f1f0ec",
                color: "var(--fh-slate)",
                fontWeight: 500,
                fontSize: "0.78rem",
                padding: "0.45rem 0.7rem",
              }}
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center pt-3 border-top flex-wrap gap-2">
          <div>
            <span className="fh-muted d-block" style={{ fontSize: "0.8rem" }}>
              Budget
            </span>
            <strong style={{ fontSize: "1.3rem", color: "var(--fh-navy)" }}>
              ${currentProject.budget}
            </strong>
          </div>

          <div className="d-flex gap-2">
            {isOwner && (
              <Link to={`/projects/${currentProject._id}/edit`} className="btn btn-fh-outline px-4">
                Edit project
              </Link>
            )}

            {isOwner && currentProject.status === "in-progress" && (
              <button
                className="btn btn-fh-primary px-4"
                onClick={handleMarkCompleted}
                disabled={isCompleting}
              >
                {isCompleting ? "Updating..." : "Mark as Completed"}
              </button>
            )}

            {user?.role === "freelancer" &&
              currentProject.status === "open" &&
              !showBidForm &&
              !hasBidSubmitted && (
                <>
                  <button className="btn btn-fh-outline px-4" onClick={handleMessageClient}>
                    Message Client
                  </button>
                  <button className="btn btn-fh-primary px-4" onClick={() => setShowBidForm(true)}>
                    Submit Proposal
                  </button>
                </>
              )}

            {user?.role === "freelancer" && hasBidSubmitted && (
              <span className="fh-muted align-self-center" style={{ fontSize: "0.85rem" }}>
                Proposal submitted
              </span>
            )}
          </div>
        </div>
      </div>

      {showBidForm && (
        <div
          className="bg-white p-4 mb-4"
          style={{ borderRadius: 6, border: "1px solid var(--fh-border)", borderLeft: "4px solid var(--fh-amber)" }}
        >
          <h5 className="mb-3">Submit your proposal</h5>
          <form onSubmit={handleSubmitBid}>
            <div className="mb-3">
              <label className="form-label">Your bid amount (USD)</label>
              <input
                type="number"
                min="1"
                className={`form-control ${bidErrors.amount ? "is-invalid" : ""}`}
                placeholder="e.g. 450"
                value={bidForm.amount}
                onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                style={{ maxWidth: 220 }}
              />
              {bidErrors.amount && <div className="invalid-feedback">{bidErrors.amount}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Message to the client</label>
              <textarea
                rows={4}
                className={`form-control ${bidErrors.message ? "is-invalid" : ""}`}
                placeholder="Explain why you're a good fit, your approach, and timeline..."
                value={bidForm.message}
                onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
              />
              {bidErrors.message && <div className="invalid-feedback">{bidErrors.message}</div>}
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-fh-primary px-4" disabled={isSubmittingBid}>
                {isSubmittingBid ? "Submitting..." : "Send proposal"}
              </button>
              <button
                type="button"
                className="btn btn-fh-outline px-4"
                onClick={() => setShowBidForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isOwner && (
        <div className="mb-4">
          <h5 className="mb-3">
            Proposals{" "}
            <span className="fh-muted" style={{ fontWeight: 400, fontSize: "0.9rem" }}>
              ({projectBids.length})
            </span>
          </h5>

          {projectBids.length === 0 ? (
            <EmptyState title="No proposals yet" body="Check back soon." />
          ) : (
            projectBids.map((bid) => (
              <BidCard key={bid._id} bid={bid} projectIsOpen={currentProject.status === "open"} />
            ))
          )}
        </div>
      )}

      {canReview && (
        <div
          className="bg-white p-4 mb-4"
          style={{ borderRadius: 6, border: "1px solid var(--fh-border)", borderLeft: "4px solid var(--fh-success)" }}
        >
          <h5 className="mb-3">
            Leave a review for {isOwner ? "the freelancer" : "the client"}
          </h5>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-3">
              <label className="form-label d-block">Rating</label>
              <StarRating
                value={reviewForm.rating}
                onChange={(rating) => setReviewForm({ ...reviewForm, rating })}
                size={30}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Comment</label>
              <textarea
                rows={3}
                className="form-control"
                placeholder="How was your experience working together?"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              />
            </div>
            {reviewError && <p style={{ color: "var(--fh-danger)", fontSize: "0.85rem" }}>{reviewError}</p>}
            <button type="submit" className="btn btn-fh-primary px-4" disabled={isSubmittingReview}>
              {isSubmittingReview ? "Submitting..." : "Submit review"}
            </button>
          </form>
        </div>
      )}

      {/* --- Dispute management (Module 14) --- */}
      {currentProject.status !== "open" && (isOwner || isSelectedFreelancer) && (
        <div
          className="bg-white p-4 mb-4"
          style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
        >
          <h5 className="mb-3">Dispute</h5>

          {currentDispute && currentDispute.status !== "resolved" && currentDispute.status !== "rejected" && (
            <div>
              <span
                className="badge rounded-pill px-3 py-2 mb-2"
                style={{ backgroundColor: "rgba(214,69,69,0.1)", color: "var(--fh-danger)", fontWeight: 600, fontSize: "0.78rem" }}
              >
                {currentDispute.status === "open" ? "Open" : "Under review"}
              </span>
              <p className="mb-0" style={{ fontSize: "0.88rem" }}>{currentDispute.reason}</p>
            </div>
          )}

          {currentDispute && (currentDispute.status === "resolved" || currentDispute.status === "rejected") && (
            <div>
              <span
                className="badge rounded-pill px-3 py-2 mb-2"
                style={{
                  backgroundColor: currentDispute.status === "resolved" ? "rgba(47,158,104,0.12)" : "#f1f0ec",
                  color: currentDispute.status === "resolved" ? "var(--fh-success)" : "var(--fh-slate)",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                }}
              >
                {currentDispute.status === "resolved" ? "Resolved" : "Rejected"}
              </span>
              <p className="mb-1" style={{ fontSize: "0.88rem" }}>{currentDispute.reason}</p>
              {currentDispute.resolutionNote && (
                <p className="fh-muted mb-0" style={{ fontSize: "0.85rem" }}>
                  Admin note: {currentDispute.resolutionNote}
                </p>
              )}
            </div>
          )}

          {!currentDispute && !showDisputeForm && (
            <button
              className="btn btn-sm px-3"
              style={{ border: "1.5px solid var(--fh-danger)", color: "var(--fh-danger)", backgroundColor: "transparent" }}
              onClick={() => setShowDisputeForm(true)}
            >
              Raise a dispute
            </button>
          )}

          {!currentDispute && showDisputeForm && (
            <form onSubmit={handleRaiseDispute}>
              <textarea
                rows={3}
                className="form-control mb-2"
                placeholder="Describe the issue..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-fh-primary btn-sm px-3">
                  Submit dispute
                </button>
                <button
                  type="button"
                  className="btn btn-fh-outline btn-sm px-3"
                  onClick={() => setShowDisputeForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {currentProject.status === "completed" && projectReviews.length > 0 && (
        <div>
          <h5 className="mb-3">Reviews</h5>
          {projectReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white p-3 mb-3"
              style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>{review.reviewer?.name}</strong>
                <StarRating value={review.rating} readOnly size={16} />
              </div>
              <p className="mb-0" style={{ fontSize: "0.9rem" }}>{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
