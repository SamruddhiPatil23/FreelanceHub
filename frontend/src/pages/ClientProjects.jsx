// pages/ClientProjects.jsx
// Purpose: the client's home screen — every project they've posted, with
// quick actions to edit or delete, and a clear call-to-action to post a new one.

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchMyProjects, deleteProject } from "../features/projects/projectSlice";
import ProjectCard from "../components/ProjectCard";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const ClientProjects = () => {
  const dispatch = useDispatch();
  const { myProjects, isLoading, error } = useSelector((state) => state.projects);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyProjects());
  }, [dispatch]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    const result = await dispatch(deleteProject(id));
    setDeletingId(null);
    setConfirmId(null);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Project deleted");
    } else {
      toast.error(result.payload || "Could not delete project");
    }
  };

  const openCount = myProjects.filter((p) => p.status === "open").length;
  const inProgressCount = myProjects.filter((p) => p.status === "in-progress").length;
  const completedCount = myProjects.filter((p) => p.status === "completed").length;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fh-display mb-1">My Projects</h2>
          <p className="fh-muted mb-0">
            {myProjects.length} project{myProjects.length !== 1 ? "s" : ""} posted
          </p>
        </div>
        <Link to="/projects/new" className="btn btn-fh-primary px-4">
          + Post a project
        </Link>
      </div>

      {myProjects.length > 0 && (
        <div className="d-flex flex-wrap gap-3 mb-4">
          <StatCard label="Open" value={openCount} accent="amber" />
          <StatCard label="In Progress" value={inProgressCount} accent="navy" />
          <StatCard label="Completed" value={completedCount} accent="success" />
        </div>
      )}

      {isLoading && <LoadingSpinner label="Loading your projects..." />}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={() => dispatch(fetchMyProjects())} />
      )}

      {!isLoading && !error && myProjects.length === 0 && (
        <EmptyState
          title="No projects posted yet"
          body="Post your first project and start receiving proposals from freelancers."
          actionLabel="Post your first project"
          actionTo="/projects/new"
        />
      )}

      {myProjects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          actions={
            <div className="d-flex gap-2">
              <Link
                to={`/projects/${project._id}/edit`}
                className="btn btn-fh-outline btn-sm px-3"
              >
                Edit
              </Link>
              {confirmId === project._id ? (
                <>
                  <button
                    className="btn btn-sm px-3"
                    style={{ backgroundColor: "var(--fh-danger)", color: "#fff" }}
                    onClick={() => handleDelete(project._id)}
                    disabled={deletingId === project._id}
                  >
                    {deletingId === project._id ? "Deleting..." : "Confirm delete"}
                  </button>
                  <button
                    className="btn btn-fh-outline btn-sm px-3"
                    onClick={() => setConfirmId(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-sm px-3"
                  style={{ border: "1.5px solid var(--fh-danger)", color: "var(--fh-danger)", backgroundColor: "transparent" }}
                  onClick={() => setConfirmId(project._id)}
                >
                  Delete
                </button>
              )}
            </div>
          }
        />
      ))}
    </div>
  );
};

export default ClientProjects;
