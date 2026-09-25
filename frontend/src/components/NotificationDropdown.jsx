// components/NotificationDropdown.jsx
// Purpose: the bell icon in the navbar — shows unread count, opens a
// dropdown of recent notifications, marks read on click, links to the
// related project.

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../features/notifications/notificationSlice";

const typeIcon = {
  new_bid: "💼",
  bid_accepted: "✅",
  project_completed: "🏁",
  review_received: "⭐",
};

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickNotification = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification._id));
    }
    setOpen(false);
    if (notification.relatedProject?._id) {
      navigate(`/projects/${notification.relatedProject._id}`);
    }
  };

  return (
    <div className="position-relative" ref={ref}>
      <button
        className="btn btn-sm position-relative"
        style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.2rem" }}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            className="position-absolute badge rounded-pill"
            style={{
              top: -2,
              right: -2,
              backgroundColor: "var(--fh-amber)",
              color: "var(--fh-navy)",
              fontSize: "0.65rem",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="position-absolute bg-white"
          style={{
            top: "calc(100% + 8px)",
            right: 0,
            width: 320,
            maxHeight: 400,
            overflowY: "auto",
            borderRadius: 6,
            border: "1px solid var(--fh-border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 1000,
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <strong style={{ fontSize: "0.9rem" }}>Notifications</strong>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm p-0"
                style={{ fontSize: "0.78rem", color: "var(--fh-navy)" }}
                onClick={() => dispatch(markAllNotificationsRead())}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p className="fh-muted text-center p-4 mb-0" style={{ fontSize: "0.85rem" }}>
              No notifications yet
            </p>
          )}

          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClickNotification(n)}
              className="p-3 border-bottom"
              style={{
                cursor: "pointer",
                backgroundColor: n.isRead ? "transparent" : "rgba(232,163,61,0.06)",
              }}
            >
              <div className="d-flex gap-2">
                <span>{typeIcon[n.type] || "🔔"}</span>
                <div className="flex-grow-1">
                  <p className="mb-1" style={{ fontSize: "0.85rem", fontWeight: n.isRead ? 400 : 600 }}>
                    {n.message}
                  </p>
                  <span className="fh-muted" style={{ fontSize: "0.72rem" }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
