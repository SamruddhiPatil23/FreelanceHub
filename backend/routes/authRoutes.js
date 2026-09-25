// routes/authRoutes.js
// Purpose: maps URL paths to controller functions. No logic lives here —
// this file only says "when this URL + method is hit, call this function".

const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
