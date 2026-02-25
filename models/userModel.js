const db = require("../db");

exports.findByEmail = (email, callback) => {
  db.query("SELECT id, username, email, password, created_at FROM users WHERE email = ?", [email], callback);
};

exports.findById = (id, callback) => {
  db.query("SELECT id, username, email, created_at FROM users WHERE id = ?", [id], callback);
};

exports.create = (username, email, passwordHash, callback) => {
  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, passwordHash],
    callback
  );
};
