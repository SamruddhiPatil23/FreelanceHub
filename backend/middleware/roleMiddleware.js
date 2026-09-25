// middleware/roleMiddleware.js
// Purpose: restricts a route to specific roles, e.g. only "client" can create a project,
// only "admin" can block a user.
// Why: authMiddleware only checks "are you logged in?" — this checks "are you ALLOWED here?"
// Usage: router.post("/", protect, authorizeRoles("client"), createProject)

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' cannot perform this action.`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
