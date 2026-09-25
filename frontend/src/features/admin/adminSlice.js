// features/admin/adminSlice.js
// Purpose: Redux state for the admin dashboard — user list, project list,
// and platform-wide analytics counts.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const initialState = {
  users: [],
  projects: [],
  analytics: null,
  pendingVerifications: [],
  disputes: [],
  transactions: [],
  isLoading: false,
  error: null,
};

export const fetchAllUsers = createAsyncThunk("admin/fetchUsers", async (_, thunkAPI) => {
  try {
    const { data } = await axiosInstance.get("/admin/users");
    return data.users;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch users");
  }
});

export const deleteUserAdmin = createAsyncThunk(
  "admin/deleteUser",
  async (userId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      return userId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

export const fetchAllProjectsAdmin = createAsyncThunk(
  "admin/fetchProjects",
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get("/admin/projects");
      return data.projects;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch projects");
    }
  }
);

export const deleteProjectAdmin = createAsyncThunk(
  "admin/deleteProject",
  async (projectId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/admin/projects/${projectId}`);
      return projectId;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete project");
    }
  }
);

export const fetchAnalytics = createAsyncThunk("admin/fetchAnalytics", async (_, thunkAPI) => {
  try {
    const { data } = await axiosInstance.get("/admin/analytics");
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch analytics");
  }
});

// --- Module 13: Verification moderation ---
export const fetchPendingVerifications = createAsyncThunk(
  "admin/fetchPendingVerifications",
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get("/verification/pending");
      return data.users;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch requests");
    }
  }
);

export const approveVerificationAdmin = createAsyncThunk(
  "admin/approveVerification",
  async (userId, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put(`/verification/${userId}/approve`);
      return data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to approve");
    }
  }
);

export const rejectVerificationAdmin = createAsyncThunk(
  "admin/rejectVerification",
  async ({ userId, reason }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put(`/verification/${userId}/reject`, { reason });
      return data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to reject");
    }
  }
);

// --- Module 14: Dispute moderation ---
export const fetchAllDisputesAdmin = createAsyncThunk(
  "admin/fetchDisputes",
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get("/disputes");
      return data.disputes;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch disputes");
    }
  }
);

export const resolveDisputeAdmin = createAsyncThunk(
  "admin/resolveDispute",
  async ({ disputeId, outcome, resolutionNote }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put(`/disputes/${disputeId}/resolve`, {
        outcome,
        resolutionNote,
      });
      return data.dispute;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to resolve dispute");
    }
  }
);

// --- Module 15: Transaction/payment review ---
export const fetchAllTransactionsAdmin = createAsyncThunk(
  "admin/fetchTransactions",
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get("/transactions");
      return data.transactions;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch transactions");
    }
  }
);

export const updateTransactionStatusAdmin = createAsyncThunk(
  "admin/updateTransactionStatus",
  async ({ transactionId, status }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put(`/transactions/${transactionId}/status`, { status });
      return data.transaction;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update transaction");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteUserAdmin.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUserAdmin.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchAllProjectsAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllProjectsAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchAllProjectsAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteProjectAdmin.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProjectAdmin.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Module 13: Verification
      .addCase(fetchPendingVerifications.fulfilled, (state, action) => {
        state.pendingVerifications = action.payload;
      })
      .addCase(approveVerificationAdmin.fulfilled, (state, action) => {
        state.pendingVerifications = state.pendingVerifications.filter(
          (u) => u._id !== action.payload._id
        );
      })
      .addCase(rejectVerificationAdmin.fulfilled, (state, action) => {
        state.pendingVerifications = state.pendingVerifications.filter(
          (u) => u._id !== action.payload._id
        );
      })
      // Module 14: Disputes
      .addCase(fetchAllDisputesAdmin.fulfilled, (state, action) => {
        state.disputes = action.payload;
      })
      .addCase(resolveDisputeAdmin.fulfilled, (state, action) => {
        state.disputes = state.disputes.map((d) =>
          d._id === action.payload._id ? action.payload : d
        );
      })
      // Module 15: Transactions
      .addCase(fetchAllTransactionsAdmin.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(updateTransactionStatusAdmin.fulfilled, (state, action) => {
        state.transactions = state.transactions.map((t) =>
          t._id === action.payload._id ? action.payload : t
        );
      });
  },
});

export default adminSlice.reducer;
