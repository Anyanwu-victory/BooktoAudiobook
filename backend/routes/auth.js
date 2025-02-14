// routes/auth.js
const express = require("express");
const { registerUser, loginUser } = require("../controllers/auth");
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login an existing user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

module.exports = router;