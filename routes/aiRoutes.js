const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/improve", authenticate, aiController.improve);
router.post("/summary", authenticate, aiController.summary);
router.post("/suggest-tags", authenticate, aiController.suggestTags);

module.exports = router;
