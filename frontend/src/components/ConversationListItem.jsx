// components/ConversationListItem.jsx
// Purpose: one row in the conversation list — shows the other participant's
// name, the project it's tied to, a preview of the last message, and an
// unread badge if there are unread messages for the current user.

const ConversationListItem = ({ conversation, currentUserId, isActive, onClick }) => {
  const otherPerson =
    conversation.client._id === currentUserId ? conversation.freelancer : conversation.client;

  const unread = conversation.unreadForMe || 0;

  return (
    <div
      onClick={onClick}
      className="d-flex align-items-center gap-2 p-3"
      style={{
        cursor: "pointer",
        backgroundColor: isActive ? "rgba(232,163,61,0.1)" : "transparent",
        borderBottom: "1px solid var(--fh-border)",
        borderLeft: isActive ? "3px solid var(--fh-amber)" : "3px solid transparent",
      }}
    >
      <div
        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: 40,
          height: 40,
          backgroundColor: "var(--fh-navy)",
          color: "#fff",
          fontSize: "0.8rem",
          fontWeight: 700,
        }}
      >
        {otherPerson.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <div className="d-flex justify-content-between align-items-center">
          <strong style={{ fontSize: "0.9rem" }}>{otherPerson.name}</strong>
          {unread > 0 && (
            <span
              className="badge rounded-pill"
              style={{ backgroundColor: "var(--fh-amber)", color: "var(--fh-navy)", fontSize: "0.7rem" }}
            >
              {unread}
            </span>
          )}
        </div>
        <div className="fh-muted text-truncate" style={{ fontSize: "0.78rem", maxWidth: 220 }}>
          {conversation.project?.title}
        </div>
        <div
          className="text-truncate"
          style={{ fontSize: "0.8rem", color: unread > 0 ? "var(--fh-ink)" : "var(--fh-slate)", fontWeight: unread > 0 ? 600 : 400 }}
        >
          {conversation.lastMessage || "No messages yet"}
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;
