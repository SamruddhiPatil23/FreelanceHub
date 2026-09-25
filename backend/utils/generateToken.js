// utils/generateToken.js
// Purpose: creates a signed JWT containing the user's id and role.
// Why a separate file: authController (login) and authController (register)
// both need to issue a token — keeping it in one place avoids repeating code.

const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
