// components/LoadingSpinner.jsx
// Purpose: one consistent loading indicator, replacing plain "Loading..."
// text scattered across pages.

const LoadingSpinner = ({ label = "Loading..." }) => (
  <div className="d-flex align-items-center gap-2 py-4 fh-muted">
    <span
      className="spinner-border spinner-border-sm"
      style={{ color: "var(--fh-amber)" }}
      role="status"
      aria-hidden="true"
    />
    <span>{label}</span>
  </div>
);

export default LoadingSpinner;
