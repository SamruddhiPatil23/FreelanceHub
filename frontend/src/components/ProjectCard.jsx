// components/ProjectCard.jsx
// Purpose: one consistent card used on both the client's "My Projects" list
// and the freelancer's "Browse Projects" list. The left accent color encodes
// status at a glance (amber=open, navy=in-progress, green=completed).
// `actions` lets each page inject its own buttons (Edit/Delete vs View).

import { Link } from "react-router-dom";

const statusClass = {
  open: "is-open",
  "in-progress": "is-progress",
  completed: "is-completed",
};

const statusLabel = {
  open: "Open",
  "in-progress": "In Progress",
  completed: "Completed",
};

const ProjectCard = ({ project, actions }) => {
  return (
    <div
      className={`fh-card-accent ${statusClass[project.status]} bg-white p-4 mb-3`}
      style={{ borderRadius: 6, border: "1px solid var(--fh-border)" }}
    >
      <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
        <div>
          <Link
            to={`/projects/${project._id}`}
            className="fh-display text-decoration-none"
            style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--fh-navy)" }}
          >
            {project.title}
          </Link>
          <div className="fh-muted" style={{ fontSize: "0.82rem" }}>
            {project.category} · Posted{" "}
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
        <span
          className="badge rounded-pill px-3 py-2"
          style={{
            backgroundColor:
              project.status === "completed"
                ? "rgba(47,158,104,0.12)"
                : project.status === "in-progress"
                ? "rgba(22,33,62,0.08)"
                : "rgba(232,163,61,0.15)",
            color:
              project.status === "completed"
                ? "var(--fh-success)"
                : project.status === "in-progress"
                ? "var(--fh-navy)"
                : "var(--fh-amber-dark)",
            fontWeight: 600,
            fontSize: "0.78rem",
          }}
        >
          {statusLabel[project.status]}
        </span>
      </div>

      <p className="mb-3" style={{ fontSize: "0.92rem", color: "var(--fh-ink)" }}>
        {project.description.length > 150
          ? project.description.slice(0, 150) + "..."
          : project.description}
      </p>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex flex-wrap gap-2">
          {(project.skillsRequired || []).slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="badge rounded-pill"
              style={{
                backgroundColor: "#f1f0ec",
                color: "var(--fh-slate)",
                fontWeight: 500,
                fontSize: "0.75rem",
                padding: "0.4rem 0.65rem",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
        <div className="d-flex align-items-center gap-3">
          <strong style={{ color: "var(--fh-navy)" }}>${project.budget}</strong>
          {actions}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
