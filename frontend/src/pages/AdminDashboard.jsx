// pages/AdminDashboard.jsx
// Purpose: real Module 7 dashboard — analytics stat cards, a users table with
// delete, and a projects table with delete. Simple tab toggle keeps both
// management views on one page without overcrowding it.

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchAnalytics,
  fetchAllUsers,
  deleteUserAdmin,
  fetchAllProjectsAdmin,
  deleteProjectAdmin,
  fetchPendingVerifications,
  approveVerificationAdmin,
  rejectVerificationAdmin,
  fetchAllDisputesAdmin,
  resolveDisputeAdmin,
  fetchAllTransactionsAdmin,
  updateTransactionStatusAdmin,
} from "../features/admin/adminSlice";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const statusLabel = {
  open: "Open",
  "in-progress": "In Progress",
  completed: "Completed",
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users, projects, analytics, isLoading, error, pendingVerifications, disputes, transactions } =
    useSelector((state) => state.admin);
  const [tab, setTab] = useState("users");
  const [confirmId, setConfirmId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchAllUsers());
    dispatch(fetchAllProjectsAdmin());
    dispatch(fetchPendingVerifications());
    dispatch(fetchAllDisputesAdmin());
    dispatch(fetchAllTransactionsAdmin());
  }, [dispatch]);

  const handleDeleteUser = async (id, name) => {
    const result = await dispatch(deleteUserAdmin(id));
    setConfirmId(null);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(`${name} removed from the platform`);
      dispatch(fetchAnalytics());
    } else {
      toast.error(result.payload || "Could not delete user");
    }
  };

  const handleDeleteProject = async (id, title) => {
    const result = await dispatch(deleteProjectAdmin(id));
    setConfirmId(null);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(`"${title}" removed`);
      dispatch(fetchAnalytics());
    } else {
      toast.error(result.payload || "Could not delete project");
    }
  };

  // Module 13: verification moderation
  const handleApproveVerification = async (id, name) => {
    const result = await dispatch(approveVerificationAdmin(id));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(`${name} is now verified`);
    } else {
      toast.error(result.payload || "Could not approve");
    }
  };

  const handleRejectVerification = async (id, name) => {
    const result = await dispatch(rejectVerificationAdmin({ userId: id, reason: "" }));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(`${name}'s request rejected`);
    } else {
      toast.error(result.payload || "Could not reject");
    }
  };

  // Module 14: dispute resolution
  const handleResolveDispute = async (id, outcome) => {
    const result = await dispatch(resolveDisputeAdmin({ disputeId: id, outcome, resolutionNote }));
    setResolvingId(null);
    setResolutionNote("");
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(`Dispute marked as ${outcome}`);
    } else {
      toast.error(result.payload || "Could not update dispute");
    }
  };

  // Module 15: transaction status override
  const handleTransactionStatusChange = async (id, status) => {
    const result = await dispatch(updateTransactionStatusAdmin({ transactionId: id, status }));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Transaction status updated");
    } else {
      toast.error(result.payload || "Could not update transaction");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fh-display mb-1">Admin Dashboard</h2>
      <p className="fh-muted mb-4">Platform overview and moderation tools</p>

      {analytics ? (
        <div className="d-flex flex-wrap gap-3 mb-5">
          <StatCard label="Total Users" value={analytics.totalUsers} accent="navy" />
          <StatCard label="Clients" value={analytics.totalClients} accent="amber" />
          <StatCard label="Freelancers" value={analytics.totalFreelancers} accent="amber" />
          <StatCard label="Total Projects" value={analytics.totalProjects} accent="navy" />
          <StatCard label="Total Bids" value={analytics.totalBids} accent="navy" />
          <StatCard label="Completed Projects" value={analytics.completedProjects} accent="success" />
        </div>
      ) : (
        <LoadingSpinner label="Loading analytics..." />
      )}

      <div className="d-flex gap-2 mb-4">
        <button
          className={tab === "users" ? "btn btn-fh-primary px-4" : "btn btn-fh-outline px-4"}
          onClick={() => setTab("users")}
        >
          Users ({users.length})
        </button>
        <button
          className={tab === "projects" ? "btn btn-fh-primary px-4" : "btn btn-fh-outline px-4"}
          onClick={() => setTab("projects")}
        >
          Projects ({projects.length})
        </button>
        <button
          className={tab === "verifications" ? "btn btn-fh-primary px-4" : "btn btn-fh-outline px-4"}
          onClick={() => setTab("verifications")}
        >
          Verifications ({pendingVerifications.length})
        </button>
        <button
          className={tab === "disputes" ? "btn btn-fh-primary px-4" : "btn btn-fh-outline px-4"}
          onClick={() => setTab("disputes")}
        >
          Disputes ({disputes.length})
        </button>
        <button
          className={tab === "payments" ? "btn btn-fh-primary px-4" : "btn btn-fh-outline px-4"}
          onClick={() => setTab("payments")}
        >
          Payments ({transactions.length})
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && error && (
        <ErrorState
          message={error}
          onRetry={() => {
            dispatch(fetchAnalytics());
            dispatch(fetchAllUsers());
            dispatch(fetchAllProjectsAdmin());
          }}
        />
      )}

      {tab === "users" && !isLoading && !error && (
        <>
          {users.length === 0 ? (
            <EmptyState title="No users found" />
          ) : (
            <div
              className="bg-white"
              style={{ borderRadius: 6, border: "1px solid var(--fh-border)", overflowX: "auto" }}
            >
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th className="ps-3">Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Rating</th>
                    <th className="text-end pe-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="ps-3">{u.name}</td>
                      <td className="fh-muted">{u.email}</td>
                      <td className="text-capitalize">{u.role}</td>
                      <td className="fh-muted">
                        {u.totalReviews > 0 ? `${u.averageRating} ★ (${u.totalReviews})` : "—"}
                      </td>
                      <td className="text-end pe-3">
                        {confirmId === u._id ? (
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              className="btn btn-sm px-3"
                              style={{ backgroundColor: "var(--fh-danger)", color: "#fff" }}
                              onClick={() => handleDeleteUser(u._id, u.name)}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn btn-fh-outline btn-sm px-3"
                              onClick={() => setConfirmId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm px-3"
                            style={{
                              border: "1.5px solid var(--fh-danger)",
                              color: "var(--fh-danger)",
                              backgroundColor: "transparent",
                            }}
                            onClick={() => setConfirmId(u._id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "projects" && !isLoading && !error && (
        <>
          {projects.length === 0 ? (
            <EmptyState title="No projects found" />
          ) : (
            <div
              className="bg-white"
              style={{ borderRadius: 6, border: "1px solid var(--fh-border)", overflowX: "auto" }}
            >
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th className="ps-3">Title</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Budget</th>
                    <th className="text-end pe-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p._id}>
                      <td className="ps-3">{p.title}</td>
                      <td className="fh-muted">{p.client?.name}</td>
                      <td>{statusLabel[p.status]}</td>
                      <td>${p.budget}</td>
                      <td className="text-end pe-3">
                        {confirmId === p._id ? (
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              className="btn btn-sm px-3"
                              style={{ backgroundColor: "var(--fh-danger)", color: "#fff" }}
                              onClick={() => handleDeleteProject(p._id, p.title)}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn btn-fh-outline btn-sm px-3"
                              onClick={() => setConfirmId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm px-3"
                            style={{
                              border: "1.5px solid var(--fh-danger)",
                              color: "var(--fh-danger)",
                              backgroundColor: "transparent",
                            }}
                            onClick={() => setConfirmId(p._id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* --- Module 13: Verifications tab --- */}
      {tab === "verifications" && !isLoading && !error && (
        <>
          {pendingVerifications.length === 0 ? (
            <EmptyState title="No pending verification requests" />
          ) : (
            <div className="bg-white" style={{ borderRadius: 6, border: "1px solid var(--fh-border)", overflowX: "auto" }}>
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th className="ps-3">Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Note</th>
                    <th className="text-end pe-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingVerifications.map((u) => (
                    <tr key={u._id}>
                      <td className="ps-3">{u.name}</td>
                      <td className="fh-muted">{u.email}</td>
                      <td className="text-capitalize">{u.role}</td>
                      <td className="fh-muted">{u.verificationNote || "—"}</td>
                      <td className="text-end pe-3">
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm px-3"
                            style={{ backgroundColor: "var(--fh-success)", color: "#fff" }}
                            onClick={() => handleApproveVerification(u._id, u.name)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm px-3"
                            style={{ border: "1.5px solid var(--fh-danger)", color: "var(--fh-danger)", backgroundColor: "transparent" }}
                            onClick={() => handleRejectVerification(u._id, u.name)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* --- Module 14: Disputes tab --- */}
      {tab === "disputes" && !isLoading && !error && (
        <>
          {disputes.length === 0 ? (
            <EmptyState title="No disputes raised" />
          ) : (
            <div className="d-flex flex-column gap-3">
              {disputes.map((d) => (
                <div
                  key={d._id}
                  className="bg-white p-3"
                  style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
                >
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                    <div>
                      <strong>{d.project?.title}</strong>
                      <div className="fh-muted" style={{ fontSize: "0.8rem" }}>
                        Raised by {d.raisedBy?.name} ({d.raisedBy?.role}) against {d.against?.name} ({d.against?.role})
                      </div>
                    </div>
                    <span
                      className="badge rounded-pill px-3 py-2 text-capitalize"
                      style={{
                        backgroundColor:
                          d.status === "resolved" ? "rgba(47,158,104,0.12)" :
                          d.status === "rejected" ? "#f1f0ec" : "rgba(214,69,69,0.1)",
                        color:
                          d.status === "resolved" ? "var(--fh-success)" :
                          d.status === "rejected" ? "var(--fh-slate)" : "var(--fh-danger)",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                      }}
                    >
                      {d.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mb-2" style={{ fontSize: "0.88rem" }}>{d.reason}</p>

                  {(d.status === "open" || d.status === "under_review") && (
                    resolvingId === d._id ? (
                      <div>
                        <textarea
                          rows={2}
                          className="form-control mb-2"
                          placeholder="Resolution note..."
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                        />
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm px-3"
                            style={{ backgroundColor: "var(--fh-success)", color: "#fff" }}
                            onClick={() => handleResolveDispute(d._id, "resolved")}
                          >
                            Mark Resolved
                          </button>
                          <button
                            className="btn btn-sm px-3"
                            style={{ border: "1.5px solid var(--fh-danger)", color: "var(--fh-danger)", backgroundColor: "transparent" }}
                            onClick={() => handleResolveDispute(d._id, "rejected")}
                          >
                            Reject Dispute
                          </button>
                          <button
                            className="btn btn-fh-outline btn-sm px-3"
                            onClick={() => { setResolvingId(null); setResolutionNote(""); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-fh-outline btn-sm px-3" onClick={() => setResolvingId(d._id)}>
                        Review & Resolve
                      </button>
                    )
                  )}

                  {(d.status === "resolved" || d.status === "rejected") && d.resolutionNote && (
                    <p className="fh-muted mb-0" style={{ fontSize: "0.85rem" }}>
                      Resolution note: {d.resolutionNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* --- Module 15: Payments tab --- */}
      {tab === "payments" && !isLoading && !error && (
        <>
          {transactions.length === 0 ? (
            <EmptyState title="No transactions found" />
          ) : (
            <div className="bg-white" style={{ borderRadius: 6, border: "1px solid var(--fh-border)", overflowX: "auto" }}>
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th className="ps-3">Project</th>
                    <th>Client</th>
                    <th>Freelancer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id}>
                      <td className="ps-3">{t.project?.title}</td>
                      <td className="fh-muted">{t.client?.name}</td>
                      <td className="fh-muted">{t.freelancer?.name}</td>
                      <td>${t.amount}</td>
                      <td className="text-capitalize">{t.status}</td>
                      <td className="text-end pe-3">
                        <select
                          className="form-select form-select-sm d-inline-block"
                          style={{ width: 130 }}
                          value={t.status}
                          onChange={(e) => handleTransactionStatusChange(t._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
