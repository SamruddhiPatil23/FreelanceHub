// pages/Profile.jsx
// Purpose: view + edit the logged-in user's profile.
// Fields shown depend on role: clients edit companyName, freelancers edit
// skills (as chips) + experience. Both can edit name, bio, and profile picture.

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { updateProfile, uploadProfileImage, requestVerification } from "../features/auth/authSlice";
import { fetchUserReviews } from "../features/reviews/reviewSlice";
import { BACKEND_URL } from "../api/axiosInstance";
import StarRating from "../components/StarRating";
import VerificationBadge from "../components/VerificationBadge";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const { userAverageRating, userTotalReviews } = useSelector((state) => state.reviews);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?._id) dispatch(fetchUserReviews(user._id));
  }, [user?._id, dispatch]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    companyName: user?.companyName || "",
    experience: user?.experience || "",
    skills: user?.skills || [],
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // --- Skill chips: type a skill, press Enter or comma to add it ---
  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (form.skills.includes(value)) {
      toast.warn(`"${value}" is already in your skills`);
      setSkillInput("");
      return;
    }
    setForm({ ...form, skills: [...form.skills, value] });
    setSkillInput("");
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skillToRemove) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skillToRemove) });
  };

  // --- Save profile ---
  const handleSave = async () => {
    if (form.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    setIsSaving(true);
    const result = await dispatch(updateProfile(form));
    setIsSaving(false);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Profile updated");
      setIsEditing(false);
    } else {
      toast.error(result.payload || "Could not update profile");
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || "",
      bio: user?.bio || "",
      companyName: user?.companyName || "",
      experience: user?.experience || "",
      skills: user?.skills || [],
    });
    setIsEditing(false);
  };

  // --- Profile image upload ---
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Only JPG and PNG images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setIsUploading(true);
    const result = await dispatch(uploadProfileImage(file));
    setIsUploading(false);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Profile picture updated");
    } else {
      toast.error(result.payload || "Upload failed");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  // Module 13: verification
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const handleRequestVerification = async () => {
    setIsRequestingVerification(true);
    const result = await dispatch(requestVerification(""));
    setIsRequestingVerification(false);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Verification request submitted — an admin will review it");
    } else {
      toast.error(result.payload || "Could not submit request");
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h3 className="fh-display mb-0">Your profile</h3>
        {!isEditing && (
          <button
            className="btn btn-fh-outline btn-sm px-3"
            onClick={() => setIsEditing(true)}
          >
            Edit profile
          </button>
        )}
      </div>

      <div
        className="bg-white p-4"
        style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
      >
        {/* --- Avatar + upload --- */}
        <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
            style={{
              width: 76,
              height: 76,
              backgroundColor: "var(--fh-navy)",
              color: "#fff",
              fontFamily: "var(--fh-font-display)",
              fontSize: "1.3rem",
              fontWeight: 700,
            }}
          >
            {user?.profileImage ? (
              <img
                src={`${BACKEND_URL}/uploads/${user.profileImage}`}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="d-none"
            />
            <button
              className="btn btn-fh-outline btn-sm px-3"
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Change photo"}
            </button>
            <p className="fh-muted mb-0 mt-1" style={{ fontSize: "0.8rem" }}>
              JPG or PNG, up to 2MB
            </p>
          </div>
        </div>

        {/* --- Rating (Module 6) --- */}
        {userTotalReviews > 0 && (
          <div className="d-flex align-items-center gap-2 mb-4 pb-4 border-bottom">
            <StarRating value={Math.round(userAverageRating)} readOnly size={18} />
            <span className="fh-muted" style={{ fontSize: "0.85rem" }}>
              {userAverageRating} ({userTotalReviews} review{userTotalReviews !== 1 ? "s" : ""})
            </span>
          </div>
        )}

        {/* --- Verification (Module 13) --- */}
        <div className="mb-4 pb-4 border-bottom">
          <label className="form-label fh-muted d-block" style={{ fontSize: "0.85rem" }}>
            Verification status
          </label>
          {user?.verificationStatus === "verified" && (
            <span className="d-inline-flex align-items-center gap-1" style={{ fontSize: "0.9rem", color: "var(--fh-success)", fontWeight: 600 }}>
              Verified <VerificationBadge size={14} />
            </span>
          )}
          {user?.verificationStatus === "pending" && (
            <span className="fh-muted" style={{ fontSize: "0.9rem" }}>
              Your request is pending admin review
            </span>
          )}
          {(user?.verificationStatus === "unverified" || user?.verificationStatus === "rejected") && (
            <div>
              {user?.verificationStatus === "rejected" && (
                <p className="mb-2" style={{ fontSize: "0.85rem", color: "var(--fh-danger)" }}>
                  Your previous request was rejected
                  {user?.verificationRejectionReason ? `: ${user.verificationRejectionReason}` : "."}
                </p>
              )}
              <button
                className="btn btn-fh-outline btn-sm px-3"
                onClick={handleRequestVerification}
                disabled={isRequestingVerification}
              >
                {isRequestingVerification ? "Submitting..." : "Request verification"}
              </button>
            </div>
          )}
        </div>

        {/* --- Name --- */}
        <div className="mb-3">
          <label className="form-label fh-muted" style={{ fontSize: "0.85rem" }}>
            Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
            />
          ) : (
            <p className="mb-0 fw-semibold">
              {user?.name}
              {user?.verificationStatus === "verified" && <VerificationBadge />}
            </p>
          )}
        </div>

        {/* --- Email (read-only always) --- */}
        <div className="mb-3">
          <label className="form-label fh-muted" style={{ fontSize: "0.85rem" }}>
            Email
          </label>
          <p className="mb-0 fw-semibold">{user?.email}</p>
        </div>

        {/* --- Bio --- */}
        <div className="mb-3">
          <label className="form-label fh-muted" style={{ fontSize: "0.85rem" }}>
            Bio
          </label>
          {isEditing ? (
            <textarea
              name="bio"
              className="form-control"
              rows={3}
              placeholder="Tell people a little about yourself..."
              value={form.bio}
              onChange={handleChange}
            />
          ) : (
            <p className="mb-0">{user?.bio || <span className="fh-muted">No bio yet</span>}</p>
          )}
        </div>

        {/* --- Client-only field --- */}
        {user?.role === "client" && (
          <div className="mb-3">
            <label className="form-label fh-muted" style={{ fontSize: "0.85rem" }}>
              Company name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="companyName"
                className="form-control"
                placeholder="e.g. Acme Studio"
                value={form.companyName}
                onChange={handleChange}
              />
            ) : (
              <p className="mb-0">
                {user?.companyName || <span className="fh-muted">Not set</span>}
              </p>
            )}
          </div>
        )}

        {/* --- Freelancer-only fields --- */}
        {user?.role === "freelancer" && (
          <>
            <div className="mb-3">
              <label className="form-label fh-muted" style={{ fontSize: "0.85rem" }}>
                Skills
              </label>

              {isEditing && (
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Type a skill and press Enter (e.g. React, Figma)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={addSkill}
                />
              )}

              <div className="d-flex flex-wrap gap-2">
                {form.skills.length === 0 && !isEditing && (
                  <span className="fh-muted">No skills added yet</span>
                )}
                {(isEditing ? form.skills : user?.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="badge rounded-pill d-flex align-items-center gap-1"
                    style={{
                      backgroundColor: "rgba(232,163,61,0.15)",
                      color: "var(--fh-navy)",
                      fontWeight: 500,
                      fontSize: "0.82rem",
                      padding: "0.45rem 0.7rem",
                    }}
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="btn-close"
                        style={{ fontSize: "0.55rem" }}
                        aria-label={`Remove ${skill}`}
                      />
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fh-muted" style={{ fontSize: "0.85rem" }}>
                Experience
              </label>
              {isEditing ? (
                <textarea
                  name="experience"
                  className="form-control"
                  rows={2}
                  placeholder="e.g. 3 years building React apps for small businesses"
                  value={form.experience}
                  onChange={handleChange}
                />
              ) : (
                <p className="mb-0">
                  {user?.experience || <span className="fh-muted">Not set</span>}
                </p>
              )}
            </div>
          </>
        )}

        {/* --- Save / Cancel --- */}
        {isEditing && (
          <div className="d-flex gap-2 mt-4 pt-3 border-top">
            <button
              className="btn btn-fh-primary px-4"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button
              className="btn btn-fh-outline px-4"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
