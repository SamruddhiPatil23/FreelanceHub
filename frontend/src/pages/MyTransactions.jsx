// pages/MyTransactions.jsx
// Purpose: client/freelancer view of payment records tied to their projects.
// No real payment gateway — this is tracking only. A client can mark their
// own pending transaction as "paid" (simulating an off-platform payment).

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchMyTransactions, markTransactionPaid } from "../features/transactions/transactionSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const statusStyles = {
  pending: { bg: "rgba(232,163,61,0.15)", color: "var(--fh-amber-dark)", label: "Pending" },
  paid: { bg: "rgba(47,158,104,0.12)", color: "var(--fh-success)", label: "Paid" },
  failed: { bg: "rgba(214,69,69,0.1)", color: "var(--fh-danger)", label: "Failed" },
  refunded: { bg: "#f1f0ec", color: "var(--fh-slate)", label: "Refunded" },
};

const MyTransactions = () => {
  const dispatch = useDispatch();
  const { transactions, isLoading } = useSelector((state) => state.transactions);
  const { user } = useSelector((state) => state.auth);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyTransactions());
  }, [dispatch]);

  const handleMarkPaid = async (id) => {
    setMarkingId(id);
    const result = await dispatch(markTransactionPaid(id));
    setMarkingId(null);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Marked as paid");
    } else {
      toast.error(result.payload || "Could not update transaction");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fh-display mb-1">Payments</h2>
      <p className="fh-muted mb-4">
        Payment tracking only — no live gateway is connected in this build.
      </p>

      {isLoading && <LoadingSpinner />}

      {!isLoading && transactions.length === 0 && (
        <EmptyState
          title="No transactions yet"
          body="Transactions appear here once a bid is accepted on one of your projects."
        />
      )}

      {transactions.map((t) => {
        const style = statusStyles[t.status];
        const isClient = t.client._id === user._id;
        return (
          <div
            key={t._id}
            className="bg-white p-3 mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
            style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
          >
            <div>
              <strong>{t.project?.title}</strong>
              <div className="fh-muted" style={{ fontSize: "0.82rem" }}>
                {isClient ? `To: ${t.freelancer.name}` : `From: ${t.client.name}`} · $
                {t.amount} · {t.paymentMethod}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{ backgroundColor: style.bg, color: style.color, fontWeight: 600, fontSize: "0.78rem" }}
              >
                {style.label}
              </span>
              {isClient && t.status === "pending" && (
                <button
                  className="btn btn-fh-primary btn-sm px-3"
                  onClick={() => handleMarkPaid(t._id)}
                  disabled={markingId === t._id}
                >
                  {markingId === t._id ? "Updating..." : "Mark as Paid"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyTransactions;
