/**
 * Define the Mongoose Schema for a User.
 */
"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  login_name: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  first_name: { type: String, required: true },
  last_name: { type: String, required: true },

  location: String,
  description: String,
  occupation: String,

  // NEW: fields to store the user's last activity
  last_activity_type: { type: String, default: null },          // "photo" | "comment" | "registered" | "login" | "logout"
  last_activity_time: { type: Date, default: null },            // when it happened
  last_activity_photo_file_name: { type: String, default: null } // last photo filename (for thumbnail), only for type "photo"
});

// Single model + export (your old file defined it twice)
const User = mongoose.model("User", userSchema);
module.exports = User;
