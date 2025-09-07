const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
    },
    answer: {
      type: Number,
      required: true,
    },
    addedDay: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ["Electronics", "Clothing", "Home", "Books"],
      default: "Electronics",
    },
    difficulty: {
      type: String,
      enum: ["Budget", "Standard", "Premium"],
      default: "Budget",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastReviewed: {
      type: Date,
    },
    isMemorized: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flashcard", flashcardSchema);
