import type { Flashcard } from "./flashcard";

export interface CartItem {
  _id: string;
  flashcardId: Flashcard;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
