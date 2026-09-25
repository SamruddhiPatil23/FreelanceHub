// features/auth/authSlice.js
// Purpose: Redux Toolkit slice managing auth state (user, loading, error).
// Why Redux here: user/role/token needs to be read by Navbar, PrivateRoute,
// RoleRoute, and pages all over the app — a slice avoids prop-drilling.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Load any previously logged-in user from localStorage so a page refresh
// doesn't log the user out.
const storedUser = localStorage.getItem("fh_user")
  ? JSON.parse(localStorage.getItem("fh_user"))
  : null;

const initialState = {
  user: storedUser, // { _id, name, email, role, token }
  isLoading: false,
  error: null,
};

// --- Async thunks: talk to the backend ---

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post("/auth/register", formData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// @route POST /api/verification/request   — Module 13
export const requestVerification = createAsyncThunk(
  "auth/requestVerification",
  async (note, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post("/verification/request", { note });
      return data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to submit verification request.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", formData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// @route PUT /api/users/me
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put("/users/me", profileData);
      return data.user;
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update profile.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// @route POST /api/users/me/upload
export const uploadProfileImage = createAsyncThunk(
  "auth/uploadProfileImage",
  async (file, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const { data } = await axiosInstance.post("/users/me/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.profileImage; // just the filename
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to upload image.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("fh_user");
      state.user = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        localStorage.setItem("fh_user", JSON.stringify(action.payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        localStorage.setItem("fh_user", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update profile: merge returned fields into existing user, KEEP the token
      // (the update endpoint doesn't return one — only auth/register/login do).
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("fh_user", JSON.stringify(state.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Upload profile image: only the filename changes
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.user = { ...state.user, profileImage: action.payload };
        localStorage.setItem("fh_user", JSON.stringify(state.user));
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Module 13: verification status changes on the current user
      .addCase(requestVerification.fulfilled, (state, action) => {
        state.user = { ...state.user, verificationStatus: action.payload.verificationStatus };
        localStorage.setItem("fh_user", JSON.stringify(state.user));
      })
      .addCase(requestVerification.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
