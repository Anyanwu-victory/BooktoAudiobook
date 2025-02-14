// controllers/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Register a new user
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {object} - The registered user
 */
async function registerUser(name, email, password) {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create a new user
    const user = new User({ name, email, password });
    await user.save(); // Save the user to the database

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Login an existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {string} - JWT token
 */
async function loginUser(email, password) {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    return token;
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { registerUser, loginUser };