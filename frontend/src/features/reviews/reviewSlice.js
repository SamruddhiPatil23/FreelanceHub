// features/reviews/reviewSlice.js
// Purpose: Redux state for reviews — a user's public review history/rating,
// and the reviews tied to one specific project (used to gate the review form).

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const initialState = {
  userReviews: [],
  userAverageRating: 0,
  userTotalReviews: 0,
  projectReviews: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// @route POST /api/reviews
export const submitReview = createAsyncThunk(
  "reviews/submit",
  async ({ projectId, rating, comment }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post("/reviews", { projectId, rating, comment });
      return data.review;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to submit review"
      );
    }
  }
);

// @route GET /api/reviews/user/:userId
export const fetchUserReviews = createAsyncThunk(
  "reviews/fetchForUser",
  async (userId, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get(`/reviews/user/${userId}`);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch reviews"
      );
    }
  }
);

// @route GET /api/reviews/project/:projectId
export const fetchProjectReviews = createAsyncThunk(
  "reviews/fetchForProject",
  async (projectId, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get(`/reviews/project/${projectId}`);
      return data.reviews;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch project reviews"
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearProjectReviews: (state) => {
      state.projectReviews = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitReview.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.projectReviews.push(action.payload);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      .addCase(fetchUserReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userReviews = action.payload.reviews;
        state.userAverageRating = action.payload.averageRating;
        state.userTotalReviews = action.payload.totalReviews;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjectReviews.fulfilled, (state, action) => {
        state.projectReviews = action.payload;
      })
      .addCase(fetchProjectReviews.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearProjectReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
