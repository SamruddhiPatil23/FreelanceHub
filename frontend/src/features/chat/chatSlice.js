// features/chat/chatSlice.js
// Purpose: Redux state for chat. REST thunks handle listing/history/creating
// a conversation; live message delivery comes through socket events, which
// dispatch the plain reducers below (addMessage, updateConversationPreview).

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get("/chats");
      return data.conversations;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load conversations");
    }
  }
);

export const getOrCreateConversation = createAsyncThunk(
  "chat/getOrCreate",
  async ({ projectId, freelancerId }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post("/chats", { projectId, freelancerId });
      return data.conversation;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to start conversation");
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get(`/chats/${conversationId}/messages`);
      return data.messages;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load messages");
    }
  }
);

export const markConversationRead = createAsyncThunk(
  "chat/markRead",
  async (conversationId, thunkAPI) => {
    try {
      await axiosInstance.put(`/chats/${conversationId}/read`);
      return conversationId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to mark read");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
      state.messages = [];
    },
    clearChat: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateConversationPreview: (state, action) => {
      const { conversationId, lastMessage, lastMessageAt, unreadForMe } = action.payload;
      const convo = state.conversations.find((c) => c._id === conversationId);
      if (convo) {
        convo.lastMessage = lastMessage;
        convo.lastMessageAt = lastMessageAt;
        convo.unreadForMe = unreadForMe;
        state.conversations = [
          convo,
          ...state.conversations.filter((c) => c._id !== conversationId),
        ];
      }
    },
    resetUnreadFor: (state, action) => {
      const convo = state.conversations.find((c) => c._id === action.payload);
      if (convo) convo.unreadForMe = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        const exists = state.conversations.some((c) => c._id === action.payload._id);
        if (!exists) state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
      })
      .addCase(getOrCreateConversation.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(markConversationRead.fulfilled, (state, action) => {
        const convo = state.conversations.find((c) => c._id === action.payload);
        if (convo) convo.unreadForMe = 0;
      });
  },
});

export const {
  setCurrentConversation,
  clearChat,
  addMessage,
  updateConversationPreview,
  resetUnreadFor,
} = chatSlice.actions;
export default chatSlice.reducer;
