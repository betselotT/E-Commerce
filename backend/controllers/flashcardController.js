// backend/controllers/flashcardController.js
const Flashcard = require("../models/Flashcard");
const { protect } = require("../middleware/authMiddleware");

exports.createFlashcard = [
  protect,
  async (req, res) => {
    const { word, answer, category, difficulty } = req.body;
    const userId = req.userId;

    try {
      const flashcard = new Flashcard({
        word,
        answer,
        category,
        difficulty,
        userId,
      });
      await flashcard.save();
      res.status(201).json(flashcard);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
];

exports.getFlashcards = [
  protect,
  async (req, res) => {
    const userId = req.userId;

    try {
      const flashcards = await Flashcard.find({ userId }).sort({
        addedDay: -1,
      });
      res.json(flashcards);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
];

exports.updateFlashcard = [
  protect,
  async (req, res) => {
    const { id } = req.params;
    const { word, answer, category, difficulty, isMemorized } = req.body;
    const userId = req.userId;

    try {
      const flashcard = await Flashcard.findOneAndUpdate(
        { _id: id, userId },
        {
          word,
          answer,
          category,
          difficulty,
          isMemorized,
          lastReviewed: Date.now(),
        },
        { new: true, runValidators: true }
      );
      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }
      res.json(flashcard);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
];

exports.deleteFlashcard = [
  protect,
  async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
      const flashcard = await Flashcard.findOneAndDelete({ _id: id, userId });
      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }
      res.json({ message: "Flashcard deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
];
