// App.jsx
// Purpose: defines every route in the app, wires up route guards, and
// manages the Socket.io connection lifecycle (connect on login, disconnect
// on logout) plus global real-time listeners for notifications and chat
// preview updates that need to work no matter which page the user is on.

import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProjectForm from "./pages/ProjectForm";
import ProjectDetail from "./pages/ProjectDetail";
import MyBids from "./pages/MyBids";
import Messages from "./pages/Messages";
import MyTransactions from "./pages/MyTransactions";
import NotFound from "./pages/NotFound";

import { connectSocket, disconnectSocket } from "./socket/socketClient";
import { receiveNotification } from "./features/notifications/notificationSlice";
import { updateConversationPreview, fetchConversations } from "./features/chat/chatSlice";

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Module 11/12: connect the socket whenever a user is logged in, and set
  // up the two global listeners (notifications + chat preview updates) that
  // need to fire regardless of which page is currently open.
  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(user.token);

    // Load conversations app-wide so the Navbar's unread-messages badge is
    // correct even before the user ever opens the Messages page.
    if (user.role === "client" || user.role === "freelancer") {
      dispatch(fetchConversations());
    }

    const handleNotification = (notification) => {
      dispatch(receiveNotification(notification));
      toast.info(notification.message);
    };
    const handleConversationUpdate = (payload) => {
      dispatch(updateConversationPreview(payload));
    };

    socket.on("newNotification", handleNotification);
    socket.on("conversationUpdated", handleConversationUpdate);

    return () => {
      socket.off("newNotification", handleNotification);
      socket.off("conversationUpdated", handleConversationUpdate);
    };
  }, [user, dispatch]);

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes: must be logged in */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />

          {/* Client-only routes */}
          <Route element={<RoleRoute allowedRoles={["client"]} />}>
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />
          </Route>

          {/* Freelancer-only routes */}
          <Route element={<RoleRoute allowedRoles={["freelancer"]} />}>
            <Route path="/my-bids" element={<MyBids />} />
          </Route>

          {/* Client + Freelancer: payment tracking (Module 15) */}
          <Route element={<RoleRoute allowedRoles={["client", "freelancer"]} />}>
            <Route path="/transactions" element={<MyTransactions />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
