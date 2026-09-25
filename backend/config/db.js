// config/db.js
// Purpose: connects our backend to MongoDB using Mongoose.
// Why: Every controller needs a live DB connection before the server can serve requests.

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // stop the server if DB fails to connect
  }
};

module.exports = connectDB;
