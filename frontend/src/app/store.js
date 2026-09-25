import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import projectReducer from "../features/projects/projectSlice";
import bidReducer from "../features/bids/bidSlice";
import reviewReducer from "../features/reviews/reviewSlice";
import adminReducer from "../features/admin/adminSlice";
import chatReducer from "../features/chat/chatSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import disputeReducer from "../features/disputes/disputeSlice";
import transactionReducer from "../features/transactions/transactionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    bids: bidReducer,
    reviews: reviewReducer,
    admin: adminReducer,
    chat: chatReducer,
    notifications: notificationReducer,
    disputes: disputeReducer,
    transactions: transactionReducer,
  },
});
