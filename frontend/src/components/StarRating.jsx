// components/StarRating.jsx
// Purpose: one component for BOTH picking a rating (review form) and
// displaying one (review history, profile badge) — avoids two implementations
// of "5 stars" drifting apart visually.

const StarRating = ({ value = 0, onChange, readOnly = false, size = 22 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="d-inline-flex" style={{ gap: 2 }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onChange && onChange(star)}
          style={{
            cursor: readOnly ? "default" : "pointer",
            fontSize: size,
            lineHeight: 1,
            color: star <= value ? "var(--fh-amber)" : "#d8d5cd",
            transition: readOnly ? "none" : "color 0.1s ease",
          }}
          role={readOnly ? undefined : "button"}
          aria-label={readOnly ? undefined : `Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
