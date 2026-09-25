// pages/MyBids.jsx
// Purpose: freelancer's view of every proposal they've submitted, across all
// projects, with the current status of each.

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyBids } from "../features/bids/bidSlice";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const statusStyles = {
  pending: { bg: "#f1f0ec", color: "var(--fh-slate)", label: "Pending" },
  shortlisted: { bg: "rgba(232,163,61,0.15)", color: "var(--fh-amber-dark)", label: "Shortlisted" },
  accepted: { bg: "rgba(47,158,104,0.12)", color: "var(--fh-success)", label: "Accepted" },
  rejected: { bg: "rgba(214,69,69,0.1)", color: "var(--fh-danger)", label: "Not selected" },
};

const MyBids = () => {
  const dispatch = useDispatch();
  const { myBids, isLoading, error } = useSelector((state) => state.bids);

  useEffect(() => {
    dispatch(fetchMyBids());
  }, [dispatch]);

  const pendingCount = myBids.filter((b) => b.status === "pending").length;
  const shortlistedCount = myBids.filter((b) => b.status === "shortlisted").length;
  const acceptedCount = myBids.filter((b) => b.status === "accepted").length;

  return (
    <div className="container py-5">
      <h2 className="fh-display mb-1">My Proposals</h2>
      <p className="fh-muted mb-4">
        {myBids.length} proposal{myBids.length !== 1 ? "s" : ""} submitted
      </p>

      {myBids.length > 0 && (
        <div className="d-flex flex-wrap gap-3 mb-4">
          <StatCard label="Pending" value={pendingCount} accent="amber" />
          <StatCard label="Shortlisted" value={shortlistedCount} accent="navy" />
          <StatCard label="Accepted" value={acceptedCount} accent="success" />
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={() => dispatch(fetchMyBids())} />
      )}

      {!isLoading && !error && myBids.length === 0 && (
        <EmptyState
          title="You haven't submitted any proposals yet"
          body="Browse open projects and send your first proposal."
          actionLabel="Browse projects"
          actionTo="/"
        />
      )}

      {myBids.map((bid) => {
        const style = statusStyles[bid.status];
        return (
          <div
            key={bid._id}
            className="bg-white p-3 mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
            style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
          >
            <div>
              <Link
                to={`/projects/${bid.project?._id}`}
                className="text-decoration-none"
                style={{ fontWeight: 700, color: "var(--fh-navy)" }}
              >
                {bid.project?.title || "Project no longer available"}
              </Link>
              <div className="fh-muted" style={{ fontSize: "0.82rem" }}>
                Your bid: ${bid.amount}
              </div>
            </div>
            <span
              className="badge rounded-pill px-3 py-2"
              style={{ backgroundColor: style.bg, color: style.color, fontWeight: 600, fontSize: "0.78rem" }}
            >
              {style.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default MyBids;
