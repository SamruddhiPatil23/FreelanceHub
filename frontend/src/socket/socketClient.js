// socket/socketClient.js
// Purpose: one shared Socket.io connection for the whole app (chat +
// notifications both use it), authenticated with the same JWT as the REST API.

import { io } from "socket.io-client";
import { BACKEND_URL } from "../api/axiosInstance";

let socket = null;

export const connectSocket = (token) => {
  if (socket && socket.connected) return socket;

  socket = io(BACKEND_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
