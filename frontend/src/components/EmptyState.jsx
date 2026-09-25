// components/EmptyState.jsx
// Purpose: one consistent "nothing here yet" block — an invitation to act,
// not just a blank list — used across every page that can be empty.

import { Link } from "react-router-dom";

const EmptyState = ({ title, body, actionLabel, onAction, actionTo }) => (
  <div
    className="bg-white p-5 text-center"
    style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
  >
    <h5 className="mb-2">{title}</h5>
    {body && <p className="fh-muted mb-3">{body}</p>}
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn btn-fh-primary px-4">
        {actionLabel}
      </Link>
    )}
    {actionLabel && onAction && !actionTo && (
      <button className="btn btn-fh-primary px-4" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
