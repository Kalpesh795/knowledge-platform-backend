const aiService = require("../services/aiService");
const { authenticate } = require("../middleware/authMiddleware");

exports.improve = async (req, res) => {
  const { option, content, title } = req.body;
  const allowed = ["rewrite", "grammar", "concise", "title"];
  const opt = allowed.includes(option) ? option : "rewrite";
  try {
    const result = await aiService.improveContent(opt, content, title);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: "AI service error" });
  }
};

exports.summary = async (req, res) => {
  const { content } = req.body;
  try {
    const result = await aiService.generateSummary(content);
    res.json({ summary: result });
  } catch (err) {
    res.status(500).json({ error: "AI service error" });
  }
};

exports.suggestTags = async (req, res) => {
  const { content } = req.body;
  try {
    const result = await aiService.suggestTags(content);
    res.json({ tags: result });
  } catch (err) {
    res.status(500).json({ error: "AI service error" });
  }
};
