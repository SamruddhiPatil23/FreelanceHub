// components/ErrorState.jsx
// Purpose: one consistent way to show "something failed to load" with a
// retry action — used instead of silently leaving a blank list when an
// API call fails (network drop, backend down, etc).

const ErrorState = ({ message = "Something went wrong. Please try again.", onRetry }) => (
  <div
    className="p-4 text-center mb-3"
    style={{
      borderRadius: 6,
      border: "1px solid rgba(214,69,69,0.3)",
      backgroundColor: "rgba(214,69,69,0.05)",
    }}
  >
    <p className="mb-2" style={{ color: "var(--fh-danger)", fontWeight: 500, fontSize: "0.9rem" }}>
      {message}
    </p>
    {onRetry && (
      <button className="btn btn-fh-outline btn-sm px-3" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export default ErrorState;
