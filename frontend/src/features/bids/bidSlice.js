// features/bids/bidSlice.js
// Purpose: Redux state for bids — a client's view of proposals on one of
// their projects, and a freelancer's view of their own submitted proposals.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const initialState = {
  projectBids: [], // bids for one project (client view)
  myBids: [],       // bids the freelancer has submitted
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// @route POST /api/bids
export const submitBid = createAsyncThunk(
  "bids/submit",
  async ({ projectId, amount, message }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post("/bids", { projectId, amount, message });
      return data.bid;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to submit proposal"
      );
    }
  }
);

// @route GET /api/bids/project/:projectId
export const fetchBidsForProject = createAsyncThunk(
  "bids/fetchForProject",
  async (projectId, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get(`/bids/project/${projectId}`);
      return data.bids;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch proposals"
      );
    }
  }
);

// @route GET /api/bids/my
export const fetchMyBids = createAsyncThunk("bids/fetchMine", async (_, thunkAPI) => {
  try {
    const { data } = await axiosInstance.get("/bids/my");
    return data.bids;
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch your proposals"
    );
  }
});

// @route PUT /api/bids/:id/shortlist
export const shortlistBid = createAsyncThunk(
  "bids/shortlist",
  async (bidId, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put(`/bids/${bidId}/shortlist`);
      return data.bid;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to shortlist proposal"
      );
    }
  }
);

// @route PUT /api/bids/:id/accept
export const acceptBid = createAsyncThunk("bids/accept", async (bidId, thunkAPI) => {
  try {
    const { data } = await axiosInstance.put(`/bids/${bidId}/accept`);
    return data; // { bid, project }
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to accept proposal"
    );
  }
});

const bidSlice = createSlice({
  name: "bids",
  initialState,
  reducers: {
    clearProjectBids: (state) => {
      state.projectBids = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit
      .addCase(submitBid.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitBid.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(submitBid.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      // Bids for a project (client)
      .addCase(fetchBidsForProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBidsForProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projectBids = action.payload;
      })
      .addCase(fetchBidsForProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // My bids (freelancer)
      .addCase(fetchMyBids.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBids = action.payload;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Shortlist — update just that one bid in projectBids
      .addCase(shortlistBid.fulfilled, (state, action) => {
        state.projectBids = state.projectBids.map((b) =>
          b._id === action.payload._id ? action.payload : b
        );
      })
      .addCase(shortlistBid.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Accept — the accepted bid becomes "accepted", everything else "rejected"
      .addCase(acceptBid.fulfilled, (state, action) => {
        state.projectBids = state.projectBids.map((b) =>
          b._id === action.payload.bid._id
            ? action.payload.bid
            : { ...b, status: "rejected" }
        );
      })
      .addCase(acceptBid.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearProjectBids } = bidSlice.actions;
export default bidSlice.reducer;
