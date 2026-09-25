// components/BidCard.jsx
// Purpose: one proposal shown to the client reviewing bids on their project.
// Shortlist/Accept buttons only show while the bid is still "pending" or
// "shortlisted" — once any bid is accepted, the whole project is closed.

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { shortlistBid, acceptBid } from "../features/bids/bidSlice";
import { getOrCreateConversation } from "../features/chat/chatSlice";
import { BACKEND_URL } from "../api/axiosInstance";
import VerificationBadge from "./VerificationBadge";

const statusStyles = {
  pending: { bg: "#f1f0ec", color: "var(--fh-slate)", label: "Pending" },
  shortlisted: { bg: "rgba(232,163,61,0.15)", color: "var(--fh-amber-dark)", label: "Shortlisted" },
  accepted: { bg: "rgba(47,158,104,0.12)", color: "var(--fh-success)", label: "Accepted" },
  rejected: { bg: "rgba(214,69,69,0.1)", color: "var(--fh-danger)", label: "Not selected" },
};

const BidCard = ({ bid, projectIsOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const style = statusStyles[bid.status];

  const handleMessage = async () => {
    const result = await dispatch(
      getOrCreateConversation({ projectId: bid.project, freelancerId: bid.freelancer._id })
    );
    if (result.meta.requestStatus === "fulfilled") {
      navigate(`/messages/${result.payload._id}`);
    } else {
      toast.error(result.payload || "Could not start conversation");
    }
  };

  const handleShortlist = async () => {
    const result = await dispatch(shortlistBid(bid._id));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(`${bid.freelancer.name} shortlisted`);
    } else {
      toast.error(result.payload || "Could not shortlist");
    }
  };

  const handleAccept = async () => {
    const result = await dispatch(acceptBid(bid._id));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(`Proposal accepted — ${bid.freelancer.name} is now working on this project`);
    } else {
      toast.error(result.payload || "Could not accept proposal");
    }
  };

  const initials = bid.freelancer.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="bg-white p-3 mb-3"
      style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
    >
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div className="d-flex gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
            style={{
              width: 46,
              height: 46,
              backgroundColor: "var(--fh-navy)",
              color: "#fff",
              fontFamily: "var(--fh-font-display)",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            {bid.freelancer.profileImage ? (
              <img
                src={`${BACKEND_URL}/uploads/${bid.freelancer.profileImage}`}
                alt={bid.freelancer.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <strong>
              {bid.freelancer.name}
              {bid.freelancer.verificationStatus === "verified" && <VerificationBadge size={12} />}
            </strong>
            <div className="fh-muted" style={{ fontSize: "0.8rem" }}>
              {(bid.freelancer.skills || []).slice(0, 3).join(" · ") || "No skills listed"}
            </div>
          </div>
        </div>

        <span
          className="badge rounded-pill px-3 py-2"
          style={{ backgroundColor: style.bg, color: style.color, fontWeight: 600, fontSize: "0.78rem" }}
        >
          {style.label}
        </span>
      </div>

      <p className="my-3" style={{ fontSize: "0.9rem" }}>{bid.message}</p>

      <div className="d-flex justify-content-between align-items-center pt-2 border-top flex-wrap gap-2">
        <strong style={{ color: "var(--fh-navy)" }}>${bid.amount}</strong>

        {projectIsOpen && (
          <div className="d-flex gap-2">
            <button className="btn btn-fh-outline btn-sm px-3" onClick={handleMessage}>
              Message
            </button>
            {bid.status === "pending" && (
              <button className="btn btn-fh-outline btn-sm px-3" onClick={handleShortlist}>
                Shortlist
              </button>
            )}
            {(bid.status === "pending" || bid.status === "shortlisted") && (
              <button className="btn btn-fh-primary btn-sm px-3" onClick={handleAccept}>
                Accept
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BidCard;
