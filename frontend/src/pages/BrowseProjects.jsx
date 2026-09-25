// pages/BrowseProjects.jsx
// Purpose: freelancer's home screen — search + filter open projects.
// Filtering happens server-side (query params) so this scales beyond a
// handful of projects, with a small debounce so we're not hitting the API
// on every keystroke.

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../features/projects/projectSlice";
import { CATEGORIES } from "../constants/categories";
import ProjectCard from "../components/ProjectCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const BrowseProjects = () => {
  const dispatch = useDispatch();
  const { projects, isLoading, error } = useSelector((state) => state.projects);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Debounced search: wait 400ms after the user stops typing before calling the API
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchProjects({ search, category }));
    }, 400);
    return () => clearTimeout(timer);
  }, [search, category, dispatch]);

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fh-display mb-1">Browse Projects</h2>
        <p className="fh-muted mb-0">Find open projects that match your skills</p>
      </div>

      <div className="d-flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 220 }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(search || category) && (
          <button
            className="btn btn-fh-outline btn-sm"
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading && <LoadingSpinner label="Loading projects..." />}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={() => dispatch(fetchProjects({ search, category }))} />
      )}

      {!isLoading && !error && projects.length === 0 && (
        <EmptyState
          title="No projects match your search"
          body="Try a different keyword or clear the category filter."
        />
      )}

      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
};

export default BrowseProjects;
