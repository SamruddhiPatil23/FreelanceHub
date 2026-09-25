// features/projects/projectSlice.js
// Purpose: Redux state for projects — the browse list (freelancer), the
// client's own project list, and whichever single project is open in detail view.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const initialState = {
  projects: [],        // browse list (open projects, filtered)
  myProjects: [],       // client's own projects (all statuses)
  currentProject: null, // whichever project is open on the detail page
  isLoading: false,
  error: null,
};

// @route GET /api/projects?category=&search=
export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (filters = {}, thunkAPI) => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const { data } = await axiosInstance.get("/projects", { params });
      return data.projects;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load projects"
      );
    }
  }
);

// @route GET /api/projects/my
export const fetchMyProjects = createAsyncThunk(
  "projects/fetchMine",
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get("/projects/my");
      return data.projects;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load your projects"
      );
    }
  }
);

// @route GET /api/projects/:id
export const fetchProjectById = createAsyncThunk(
  "projects/fetchOne",
  async (id, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get(`/projects/${id}`);
      return data.project;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load project"
      );
    }
  }
);

// @route POST /api/projects
export const createProject = createAsyncThunk(
  "projects/create",
  async (projectData, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post("/projects", projectData);
      return data.project;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create project"
      );
    }
  }
);

// @route PUT /api/projects/:id
export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ id, projectData }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put(`/projects/${id}`, projectData);
      return data.project;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update project"
      );
    }
  }
);

// @route DELETE /api/projects/:id
export const deleteProject = createAsyncThunk(
  "projects/delete",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/projects/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete project"
      );
    }
  }
);

// @route PUT /api/projects/:id/complete   — Module 8
export const markProjectCompleted = createAsyncThunk(
  "projects/complete",
  async (id, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put(`/projects/${id}/complete`);
      return data.project;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to mark project completed"
      );
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Browse list
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // My projects (client)
      .addCase(fetchMyProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProjects = action.payload;
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Single project
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.currentProject = null;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createProject.fulfilled, (state, action) => {
        state.myProjects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update
      .addCase(updateProject.fulfilled, (state, action) => {
        state.myProjects = state.myProjects.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        state.currentProject = action.payload;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.myProjects = state.myProjects.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Mark completed — Module 8
      .addCase(markProjectCompleted.fulfilled, (state, action) => {
        state.myProjects = state.myProjects.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        state.currentProject = action.payload;
      })
      .addCase(markProjectCompleted.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProject, clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
