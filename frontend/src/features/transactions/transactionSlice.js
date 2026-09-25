// features/transactions/transactionSlice.js
// Purpose: client/freelancer's own view of their payment records. Admin's
// list-all/status-override actions live in adminSlice.js.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const initialState = {
  transactions: [],
  isLoading: false,
  error: null,
};

export const fetchMyTransactions = createAsyncThunk(
  "transactions/fetchMine",
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get("/transactions/my");
      return data.transactions;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load transactions");
    }
  }
);

export const markTransactionPaid = createAsyncThunk(
  "transactions/markPaid",
  async (transactionId, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put(`/transactions/${transactionId}/mark-paid`);
      return data.transaction;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update transaction");
    }
  }
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchMyTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(markTransactionPaid.fulfilled, (state, action) => {
        state.transactions = state.transactions.map((t) =>
          t._id === action.payload._id ? action.payload : t
        );
      })
      .addCase(markTransactionPaid.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default transactionSlice.reducer;
