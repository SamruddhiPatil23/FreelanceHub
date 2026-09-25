// middleware/authMiddleware.js
// Purpose: checks the "Authorization: Bearer <token>" header on incoming requests,
// verifies the JWT, and attaches the logged-in user's info to req.user.
// Why: this is what makes a route "protected" — no valid token, no access.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1]; // "Bearer xxxxx" -> "xxxxx"

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // fetch user fresh from DB (without password) so req.user is always up to date
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found, token invalid" });
      }

      if (req.user.isBlocked) {
        return res.status(403).json({ message: "Your account has been blocked by admin" });
      }

      next(); // token valid, allow request to continue to controller
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
