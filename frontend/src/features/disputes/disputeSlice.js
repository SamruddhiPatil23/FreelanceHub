// features/disputes/disputeSlice.js
// Purpose: the self-service side of disputes (raise one, check a project's
// dispute status). Admin's list-all/resolve actions live in adminSlice.js
// alongside the other admin moderation tools, to keep one dashboard slice.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const initialState = {
  currentDispute: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const raiseDispute = createAsyncThunk(
  "disputes/raise",
  async ({ projectId, reason }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post("/disputes", { projectId, reason });
      return data.dispute;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to raise dispute");
    }
  }
);

export const fetchDisputeForProject = createAsyncThunk(
  "disputes/fetchForProject",
  async (projectId, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get(`/disputes/project/${projectId}`);
      return data.dispute;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch dispute");
    }
  }
);

const disputeSlice = createSlice({
  name: "disputes",
  initialState,
  reducers: {
    clearCurrentDispute: (state) => {
      state.currentDispute = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(raiseDispute.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(raiseDispute.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentDispute = action.payload;
      })
      .addCase(raiseDispute.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      .addCase(fetchDisputeForProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDisputeForProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDispute = action.payload;
      })
      .addCase(fetchDisputeForProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentDispute } = disputeSlice.actions;
export default disputeSlice.reducer;
