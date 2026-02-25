const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES = "7d";

exports.signup = (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  userModel.findByEmail(email, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (rows && rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const hash = bcrypt.hashSync(password, 10);
    userModel.create(username, email, hash, (err2, result) => {
      if (err2) return res.status(500).json({ error: "Failed to create user" });
      const token = jwt.sign(
        { id: result.insertId, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
      );
      userModel.findById(result.insertId, (err3, userRows) => {
        const user = userRows && userRows[0] ? userRows[0] : { id: result.insertId, username, email };
        delete user.password;
        res.status(201).json({ message: "User created", token, user });
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  userModel.findByEmail(email, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = rows[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    delete user.password;
    res.json({ message: "Login successful", token, user });
  });
};

exports.logout = (req, res) => {
  // JWT is stateless; client must remove token. Optionally blacklist here if you add a blacklist store.
  res.json({ message: "Logged out successfully" });
};

exports.me = (req, res) => {
  userModel.findById(req.user.id, (err, rows) => {
    if (err || !rows || rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = rows[0];
    delete user.password;
    res.json(user);
  });
};
