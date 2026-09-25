// pages/ProjectForm.jsx
// Purpose: one form handles BOTH creating a new project (/projects/new) and
// editing an existing one (/projects/:id/edit) — detected via the URL param.

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createProject,
  updateProject,
  fetchProjectById,
  clearCurrentProject,
} from "../features/projects/projectSlice";
import { CATEGORIES } from "../constants/categories";
import LoadingSpinner from "../components/LoadingSpinner";

const emptyForm = {
  title: "",
  description: "",
  budget: "",
  category: "",
  skillsRequired: [],
};

const ProjectForm = () => {
  const { id } = useParams(); // present only in edit mode
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject, isLoading } = useSelector((state) => state.projects);

  const [form, setForm] = useState(emptyForm);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In edit mode, load the existing project and pre-fill the form
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchProjectById(id));
    }
    return () => dispatch(clearCurrentProject());
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (isEditMode && currentProject) {
      setForm({
        title: currentProject.title,
        description: currentProject.description,
        budget: currentProject.budget,
        category: currentProject.category,
        skillsRequired: currentProject.skillsRequired || [],
      });
    }
  }, [isEditMode, currentProject]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (form.skillsRequired.includes(value)) {
      setSkillInput("");
      return;
    }
    setForm({ ...form, skillsRequired: [...form.skillsRequired, value] });
    setSkillInput("");
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skill) =>
    setForm({
      ...form,
      skillsRequired: form.skillsRequired.filter((s) => s !== skill),
    });

  const validate = () => {
    const errs = {};
    if (form.title.trim().length < 5) errs.title = "Title must be at least 5 characters";
    if (form.description.trim().length < 20)
      errs.description = "Description must be at least 20 characters";
    if (!form.budget || Number(form.budget) <= 0)
      errs.budget = "Enter a budget greater than 0";
    if (!form.category) errs.category = "Please select a category";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const payload = { ...form, budget: Number(form.budget) };

    const result = isEditMode
      ? await dispatch(updateProject({ id, projectData: payload }))
      : await dispatch(createProject(payload));

    setIsSubmitting(false);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(isEditMode ? "Project updated" : "Project posted");
      navigate(isEditMode ? `/projects/${id}` : "/");
    } else {
      toast.error(result.payload || "Something went wrong");
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <h3 className="fh-display mb-4">
        {isEditMode ? "Edit project" : "Post a new project"}
      </h3>

      {isEditMode && isLoading && !currentProject ? (
        <LoadingSpinner label="Loading project..." />
      ) : (
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4"
        style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
      >
        <div className="mb-3">
          <label className="form-label">Project title</label>
          <input
            type="text"
            name="title"
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            placeholder="e.g. Build a responsive landing page"
            value={form.title}
            onChange={handleChange}
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            rows={5}
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            placeholder="Describe the work, deliverables, and timeline..."
            value={form.description}
            onChange={handleChange}
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description}</div>
          )}
        </div>

        <div className="row">
          <div className="col-12 col-md-6 mb-3">
            <label className="form-label">Budget (USD)</label>
            <input
              type="number"
              name="budget"
              min="1"
              className={`form-control ${errors.budget ? "is-invalid" : ""}`}
              placeholder="500"
              value={form.budget}
              onChange={handleChange}
            />
            {errors.budget && <div className="invalid-feedback">{errors.budget}</div>}
          </div>
          <div className="col-12 col-md-6 mb-3">
            <label className="form-label">Category</label>
            <select
              name="category"
              className={`form-select ${errors.category ? "is-invalid" : ""}`}
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <div className="invalid-feedback">{errors.category}</div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Skills required</label>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Type a skill and press Enter (e.g. React, SEO)"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            onBlur={addSkill}
          />
          <div className="d-flex flex-wrap gap-2">
            {form.skillsRequired.map((skill) => (
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
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="btn-close"
                  style={{ fontSize: "0.55rem" }}
                  aria-label={`Remove ${skill}`}
                />
              </span>
            ))}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-fh-primary px-4"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
              ? "Save changes"
              : "Post project"}
          </button>
          <button
            type="button"
            className="btn btn-fh-outline px-4"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default ProjectForm;
