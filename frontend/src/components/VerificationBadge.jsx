// components/VerificationBadge.jsx
// Purpose: a small trust indicator shown next to a verified user's name —
// on their own profile, and anywhere else their name appears (bid cards, etc).

const VerificationBadge = ({ size = 14 }) => (
  <span
    title="Verified user"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size + 4,
      height: size + 4,
      borderRadius: "50%",
      backgroundColor: "var(--fh-success)",
      color: "#fff",
      fontSize: size * 0.7,
      marginLeft: 4,
      verticalAlign: "middle",
    }}
  >
    ✓
  </span>
);

export default VerificationBadge;
