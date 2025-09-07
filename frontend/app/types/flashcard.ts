export interface Flashcard {
  _id: string;
  word: string;
  answer: number;
  category: "Electronics" | "Clothing" | "Home" | "Books";
  difficulty: "Budget" | "Standard" | "Premium";
  userId: string;
  addedDay: Date;
  lastReviewed?: Date;
  isMemorized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewFlashcard {
  word: string;
  answer: number;
  category: "Electronics" | "Clothing" | "Home" | "Books";
  difficulty: "Budget" | "Standard" | "Premium";
}
