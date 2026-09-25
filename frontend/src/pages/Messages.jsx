// pages/Messages.jsx
// Purpose: the inbox — conversation list on the left, active chat on the right.
// Supports being opened directly at /messages/:conversationId (e.g. from a
// "Message" button elsewhere) or at /messages to just browse the list.

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchConversations, setCurrentConversation } from "../features/chat/chatSlice";
import ConversationListItem from "../components/ConversationListItem";
import ChatWindow from "../components/ChatWindow";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { conversations, currentConversation, isLoading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const found = conversations.find((c) => c._id === conversationId);
      if (found) dispatch(setCurrentConversation(found));
    }
  }, [conversationId, conversations, dispatch]);

  const handleSelect = (conversation) => {
    dispatch(setCurrentConversation(conversation));
    navigate(`/messages/${conversation._id}`);
  };

  return (
    <div className="container py-5">
      <h2 className="fh-display mb-4">Messages</h2>

      <div
        className="bg-white d-flex"
        style={{ borderRadius: 6, border: "1px solid var(--fh-border)", minHeight: "60vh", overflow: "hidden" }}
      >
        <div style={{ width: 300, borderRight: "1px solid var(--fh-border)", overflowY: "auto" }}>
          {isLoading && conversations.length === 0 && <LoadingSpinner label="Loading..." />}

          {!isLoading && conversations.length === 0 && (
            <div className="p-4">
              <EmptyState title="No conversations yet" body="Start a chat from a project you're working on." />
            </div>
          )}

          {conversations.map((c) => (
            <ConversationListItem
              key={c._id}
              conversation={c}
              currentUserId={user._id}
              isActive={currentConversation?._id === c._id}
              onClick={() => handleSelect(c)}
            />
          ))}
        </div>

        <div className="flex-grow-1">
          {currentConversation ? (
            <ChatWindow conversation={currentConversation} />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 fh-muted">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
