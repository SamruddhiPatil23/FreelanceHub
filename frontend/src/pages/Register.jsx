// pages/Register.jsx
// Purpose: sign-up form. Role is chosen via a segmented picker (not a plain
// dropdown) since it's the single most important decision on this form.

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser, clearAuthError } from "../features/auth/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(
      registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      })
    ).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        toast.success(`Welcome to FreelanceHub, ${form.name.split(" ")[0]}!`);
      }
    });
  };

  return (
    <div className="fh-auth-wrapper py-5 px-3">
      <div className="fh-auth-card">
        <h3 className="fh-display mb-1">Create your account</h3>
        <p className="fh-muted mb-4" style={{ fontSize: "0.92rem" }}>
          Post projects or find work — pick how you'll use FreelanceHub.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">I want to</label>
            <div className="fh-role-picker">
              <div
                className={`fh-role-option ${form.role === "client" ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: "client" })}
              >
                Hire freelancers
              </div>
              <div
                className={`fh-role-option ${form.role === "freelancer" ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: "freelancer" })}
              >
                Find work
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Full name</label>
            <input
              type="text"
              name="name"
              className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
              placeholder="Jordan Lee"
              value={form.name}
              onChange={handleChange}
            />
            {fieldErrors.name && (
              <div className="invalid-feedback">{fieldErrors.name}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {fieldErrors.email && (
              <div className="invalid-feedback">{fieldErrors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
            />
            {fieldErrors.password && (
              <div className="invalid-feedback">{fieldErrors.password}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              className={`form-control ${fieldErrors.confirmPassword ? "is-invalid" : ""}`}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {fieldErrors.confirmPassword && (
              <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-fh-primary w-100 py-2"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center mt-4 mb-0" style={{ fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" className="fh-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
