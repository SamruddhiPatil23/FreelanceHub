// server.js
// Purpose: the entry point of the backend. Sets up Express, connects middleware,
// mounts routes, initializes Socket.io (Module 11), and starts listening.

const express = require("express");
const http = require("http"); // needed so Socket.io can attach to the same server as Express
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { initializeSocket } = require("./socket");

dotenv.config();
connectDB();

const app = express();

// Global middleware
app.use(cors());              // allows frontend (different port) to call this API
app.use(express.json());      // parses incoming JSON request bodies

// Serve uploaded profile images statically, e.g. http://localhost:5000/uploads/xyz.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/bids", require("./routes/bidRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));                 // Module 11
app.use("/api/notifications", require("./routes/notificationRoutes")); // Module 12
app.use("/api/verification", require("./routes/verificationRoutes"));  // Module 13
app.use("/api/disputes", require("./routes/disputeRoutes"));           // Module 14
app.use("/api/transactions", require("./routes/transactionRoutes"));   // Module 15

// Simple health check route
app.get("/", (req, res) => {
  res.send("FreelanceHub API is running...");
});

// Basic error handler (catches anything thrown/next(err) in controllers)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// Module 11: Socket.io needs a raw http.Server, not the Express app directly,
// so both HTTP and WebSocket traffic can share the same port.
const httpServer = http.createServer(app);
initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
