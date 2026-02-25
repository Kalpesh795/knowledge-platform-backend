const articleModel = require("../models/articleModel");
const aiService = require("../services/aiService");

exports.getCategories = (req, res) => {
  res.json({ categories: articleModel.CATEGORIES });
};

exports.create = (req, res) => {
  const { title, content, category, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  articleModel.create(
    { title, content, category, tags, author_id: req.user.id },
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to create article" });
      res.status(201).json({ message: "Article created", id: result.insertId });
    }
  );
};

// Generate summary via AI at display time for Home page list
exports.list = async (req, res) => {
  const { search, category } = req.query;
  articleModel.findAll({ search, category }, async (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch articles" });
    const articles = rows || [];
    try {
      for (const row of articles) {
        const content = row.content || "";
        row.summary = await aiService.generateSummary(content);
        delete row.content; // don't send full content in list
      }
      res.json(articles);
    } catch (e) {
      console.error(e);
      // fallback: no summary, strip content
      const safe = articles.map(({ content, ...rest }) => rest);
      res.json(safe);
    }
  });
};

exports.getById = (req, res) => {
  const id = req.params.id;
  articleModel.findById(id, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(rows[0]);
  });
};

exports.getMyArticles = (req, res) => {
  articleModel.findByAuthorId(req.user.id, (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch articles" });
    res.json(rows || []);
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const { title, content, category, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  articleModel.checkAuthor(id, req.user.id, (err, isAuthor) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!isAuthor) return res.status(403).json({ error: "Only the author can edit this article" });
    articleModel.update(id, { title, content, category, tags }, (err2) => {
      if (err2) return res.status(500).json({ error: "Failed to update article" });
      res.json({ message: "Article updated" });
    });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  articleModel.checkAuthor(id, req.user.id, (err, isAuthor) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!isAuthor) return res.status(403).json({ error: "Only the author can delete this article" });
    articleModel.delete(id, (err2) => {
      if (err2) return res.status(500).json({ error: "Failed to delete article" });
      res.json({ message: "Article deleted" });
    });
  });
};
