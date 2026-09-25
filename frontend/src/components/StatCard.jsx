// components/StatCard.jsx
// Purpose: one consistent "number + label" card used across the client
// dashboard, freelancer proposal tracker, and admin analytics — so stats
// look the same everywhere instead of each page inventing its own card.

const StatCard = ({ label, value, accent = "amber" }) => {
  const accentColor =
    accent === "navy"
      ? "var(--fh-navy)"
      : accent === "success"
      ? "var(--fh-success)"
      : accent === "danger"
      ? "var(--fh-danger)"
      : "var(--fh-amber)";

  return (
    <div
      className="bg-white p-3"
      style={{
        borderRadius: 6,
        border: "1px solid var(--fh-border)",
        borderTop: `3px solid ${accentColor}`,
        minWidth: 130,
        flex: "1 1 130px",
      }}
    >
      <div
        className="fh-display"
        style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--fh-navy)" }}
      >
        {value}
      </div>
      <div className="fh-muted" style={{ fontSize: "0.8rem" }}>
        {label}
      </div>
    </div>
  );
};

export default StatCard;
