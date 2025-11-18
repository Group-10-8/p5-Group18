"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
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
});

module.exports = mongoose.model("User", userSchema);

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Make this available to our application.
 */
module.exports = User;
