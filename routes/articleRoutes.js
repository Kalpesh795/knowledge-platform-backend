const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/categories", articleController.getCategories);
router.get("/", articleController.list);
router.get("/me", authenticate, articleController.getMyArticles);
router.get("/:id", articleController.getById);
router.post("/", authenticate, articleController.create);
router.put("/:id", authenticate, articleController.update);
router.delete("/:id", authenticate, articleController.remove);

module.exports = router;
