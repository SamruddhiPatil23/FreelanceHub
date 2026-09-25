// components/Navbar.jsx
// Purpose: top navigation. Shows different links depending on whether the
// user is logged in, and what role they have. This is the one place
// role-based UI branching happens for navigation.

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { conversations } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalUnreadMessages = conversations.reduce((sum, c) => sum + (c.unreadForMe || 0), 0);

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg fh-navbar py-3">
      <div className="container">
        <Link className="navbar-brand" to="/">
          FreelanceHub
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#fhNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="fhNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Log in
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-fh-primary btn-sm px-3"
                    to="/register"
                  >
                    Get started
                  </Link>
                </li>
              </>
            )}

            {user && (
              <>
                {user.role === "client" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/">
                      My Projects
                    </Link>
                  </li>
                )}
                {user.role === "freelancer" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/">
                        Browse Projects
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-bids">
                        My Proposals
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "admin" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/">
                      Dashboard
                    </Link>
                  </li>
                )}
                {(user.role === "client" || user.role === "freelancer") && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link position-relative" to="/messages">
                        Messages
                        {totalUnreadMessages > 0 && (
                          <span
                            className="badge rounded-pill ms-1"
                            style={{ backgroundColor: "var(--fh-amber)", color: "var(--fh-navy)", fontSize: "0.65rem" }}
                          >
                            {totalUnreadMessages}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/transactions">
                        Payments
                      </Link>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                  <NotificationDropdown />
                </li>
                <li className="nav-item">
                  <span className="badge badge-role rounded-pill px-3 py-2 me-2 text-capitalize">
                    {user.role}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-fh-outline btn-sm px-3"
                    style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
