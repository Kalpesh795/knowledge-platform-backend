const db = require("../db");

const CATEGORIES = ["Tech", "AI", "Backend", "Frontend", "DevOps", "Security", "Mobile", "Other"];

exports.CATEGORIES = CATEGORIES;

exports.create = (data, callback) => {
  const { title, content, category, tags, author_id } = data;
  db.query(
    "INSERT INTO articles (title, content, category, tags, author_id) VALUES (?, ?, ?, ?, ?)",
    [title, content, category || null, tags || null, author_id],
    callback
  );
};

exports.findById = (id, callback) => {
  db.query(
    `SELECT a.id, a.title, a.content, a.category, a.tags, a.author_id, a.created_at, a.updated_at, u.username AS author_name, u.email AS author_email 
     FROM articles a 
     LEFT JOIN users u ON a.author_id = u.id 
     WHERE a.id = ?`,
    [id],
    callback
  );
};

// Returns articles with content so list endpoint can generate AI summary at display time
exports.findAll = (filters, callback) => {
  let sql = `SELECT a.id, a.title, a.content, a.category, a.tags, a.created_at, a.updated_at, u.username AS author_name 
             FROM articles a 
             LEFT JOIN users u ON a.author_id = u.id 
             WHERE 1=1`;
  const params = [];

  if (filters.category) {
    sql += " AND a.category = ?";
    params.push(filters.category);
  }
  if (filters.search) {
    sql += " AND (a.title LIKE ? OR a.content LIKE ? OR a.tags LIKE ?)";
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }
  sql += " ORDER BY a.created_at DESC";

  db.query(sql, params, callback);
};

exports.findByAuthorId = (authorId, callback) => {
  db.query(
    "SELECT id, title, category, tags, created_at, updated_at FROM articles WHERE author_id = ? ORDER BY created_at DESC",
    [authorId],
    callback
  );
};

exports.update = (id, data, callback) => {
  const { title, content, category, tags } = data;
  db.query(
    "UPDATE articles SET title = ?, content = ?, category = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, content, category || null, tags || null, id],
    callback
  );
};

exports.delete = (id, callback) => {
  db.query("DELETE FROM articles WHERE id = ?", [id], callback);
};

exports.checkAuthor = (articleId, userId, callback) => {
  db.query("SELECT author_id FROM articles WHERE id = ?", [articleId], (err, rows) => {
    if (err) return callback(err);
    if (!rows || rows.length === 0) return callback(null, false);
    callback(null, rows[0].author_id === userId);
  });
};
