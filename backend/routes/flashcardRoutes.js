// backend/routes/flashcardRoutes.js
const express = require("express");
const router = express.Router();
const {
  createFlashcard,
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
} = require("../controllers/flashcardController");

router.post("/flashcards", createFlashcard);
router.get("/flashcards", getFlashcards);
router.put("/flashcards/:id", updateFlashcard);
router.delete("/flashcards/:id", deleteFlashcard);

module.exports = router;
