const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const {
  signupSchema,
  loginSchema,
  updateSchema,
  validate,
} = require("../validators/auth");

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
  };
}

router.post("/signup", validate(signupSchema), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = signToken(user._id);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    return res.status(200).json({ token, user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find().select("username email password");
    return res.status(200).json({
      users: users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/update", auth, validate(updateSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailTaken = await User.findOne({
      email,
      _id: { $ne: req.userId },
    });
    if (emailTaken) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      req.userId,
      { email, password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
