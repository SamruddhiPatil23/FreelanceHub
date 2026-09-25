// pages/NotFound.jsx

import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="container py-5 text-center">
    <h2 className="fh-display">Page not found</h2>
    <p className="fh-muted mb-4">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn btn-fh-primary px-4">
      Back to home
    </Link>
  </div>
);

export default NotFound;
