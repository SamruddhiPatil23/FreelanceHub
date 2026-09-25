// components/ChatWindow.jsx
// Purpose: the active conversation's message thread + input box. Joins the
// conversation's socket room on mount, sends messages over the socket
// (not REST — see socket/index.js on the backend), and appends incoming
// "newMessage" events live.

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../socket/socketClient";
import { fetchMessages, addMessage, markConversationRead } from "../features/chat/chatSlice";
import LoadingSpinner from "./LoadingSpinner";

const ChatWindow = ({ conversation }) => {
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const otherPerson =
    conversation.client._id === user._id ? conversation.freelancer : conversation.client;

  useEffect(() => {
    dispatch(fetchMessages(conversation._id));
    dispatch(markConversationRead(conversation._id));

    const socket = getSocket();
    if (!socket) return;

    socket.emit("joinConversation", conversation._id);
    socket.emit("markRead", conversation._id);

    const handleNewMessage = (message) => {
      if (message.conversation === conversation._id) {
        dispatch(addMessage(message));
      }
    };
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveConversation", conversation._id);
      socket.off("newMessage", handleNewMessage);
    };
  }, [conversation._id, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const socket = getSocket();
    if (socket) {
      socket.emit("sendMessage", { conversationId: conversation._id, text: text.trim() });
    }
    setText("");
  };

  return (
    <div className="d-flex flex-column" style={{ height: "60vh" }}>
      <div className="p-3 border-bottom d-flex align-items-center gap-2">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: 36, height: 36, backgroundColor: "var(--fh-navy)", color: "#fff", fontSize: "0.8rem", fontWeight: 700 }}
        >
          {otherPerson.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <strong style={{ fontSize: "0.9rem" }}>{otherPerson.name}</strong>
          <div className="fh-muted" style={{ fontSize: "0.78rem" }}>{conversation.project?.title}</div>
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto p-3" style={{ backgroundColor: "#fbfbfa" }}>
        {isLoading && <LoadingSpinner label="Loading messages..." />}

        {!isLoading && messages.length === 0 && (
          <p className="fh-muted text-center mt-4">No messages yet — say hello!</p>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender._id === user._id;
          return (
            <div
              key={msg._id}
              className="d-flex mb-2"
              style={{ justifyContent: isMine ? "flex-end" : "flex-start" }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "0.5rem 0.8rem",
                  borderRadius: 10,
                  backgroundColor: isMine ? "var(--fh-navy)" : "#fff",
                  color: isMine ? "#fff" : "var(--fh-ink)",
                  border: isMine ? "none" : "1px solid var(--fh-border)",
                  fontSize: "0.88rem",
                }}
              >
                {msg.text}
                <div style={{ fontSize: "0.65rem", marginTop: 2, opacity: 0.7, textAlign: "right" }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {isMine && (msg.isRead ? " · Read" : " · Sent")}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-top d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-fh-primary px-4">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
