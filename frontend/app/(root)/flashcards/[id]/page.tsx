"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Flashcard, NewFlashcard } from "@/app/types/flashcard";
import { LogOut, ShoppingCart, CheckCircle } from "lucide-react";
import Link from "next/link";

const ProductManager = () => {
  const params = useParams();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newFlashcard, setNewFlashcard] = useState<NewFlashcard>({
    word: "",
    answer: 0,
    category: "Electronics",
    difficulty: "Budget",
  });
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(
    null
  );
  const [deletingFlashcard, setDeletingFlashcard] = useState<Flashcard | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!token) {
        router.push("/sign-in");
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/flashcards`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const userFlashcards = data.filter(
            (card: Flashcard) => card.userId === params.id
          );
          setFlashcards(userFlashcards);
        } else {
          setError("Failed to load products");
        }
      } catch (err) {
        setError("Server error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [token, router, params.id]);

  const handleCreateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please sign in");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/flashcards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...newFlashcard, userId: params.id }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setFlashcards([...flashcards, data]);
        setNewFlashcard({
          word: "",
          answer: 0,
          category: "Electronics",
          difficulty: "Budget",
        });
        setError("");
      } else {
        setError("Failed to create product");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlashcard || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/flashcards/${editingFlashcard._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            word: editingFlashcard.word,
            answer: editingFlashcard.answer,
            category: editingFlashcard.category,
            difficulty: editingFlashcard.difficulty,
          }),
        }
      );
      if (response.ok) {
        const updatedCard = await response.json();
        setFlashcards(
          flashcards.map((card) =>
            card._id === editingFlashcard._id ? updatedCard : card
          )
        );
        setEditingFlashcard(null);
        setError("");
      } else {
        setError("Failed to update product");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlashcard = async () => {
    if (!deletingFlashcard || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/flashcards/${deletingFlashcard._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setFlashcards(
          flashcards.filter((card) => card._id !== deletingFlashcard._id)
        );
        setDeletingFlashcard(null);
        setError("");
      } else {
        setError("Failed to delete product");
      }
    } catch (err) {
      setError("Server error while adding to cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (flashcardId: string) => {
    if (!token) {
      setError("Please sign in to add items to your cart.");
      return;
    }
    setAddingToCart(flashcardId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ flashcardId, quantity: 1 }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to add to cart");
      }
    } catch (err) {
      setError("Server error while adding to cart.");
    } finally {
      setTimeout(() => setAddingToCart(null), 1000); // Show success for 1 second
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Budget":
        return "from-green-400 to-green-600";
      case "Standard":
        return "from-green-400 to-green-600";
      case "Premium":
        return "from-purple-400 to-purple-600";
      default:
        return "from-green-400 to-green-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Electronics":
        return "📱";
      case "Clothing":
        return "👕";
      case "Home":
        return "🏠";
      case "Books":
        return "📚";
      default:
        return "📱";
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-50/50 rounded-full blur-3xl animate-ping delay-2000"></div>
      </div>

      <div className="fixed top-4 right-8 z-50 flex items-center space-x-6">
        <Link href={`/cart/${params.id}`} passHref>
          <div className="text-black transition-all duration-300 transform hover:scale-105 hover:cursor-pointer">
            <ShoppingCart size={40} />
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="text-black transition-all duration-300 transform hover:scale-105 hover:cursor-pointer font-medium"
        >
          <LogOut size={40} />
        </button>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-green-600 via-green-600 to-green-700 bg-clip-text text-transparent mb-4 animate-fade-in">
              E-Commerce Manager
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl font-light">
              Manage your product inventory with ease
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-center animate-shake">
              {error}
            </div>
          )}

          {/* Create product form */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 text-center">
                Add New Product
              </h2>
              <form
                onSubmit={handleCreateFlashcard}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium text-sm">
                      Product Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter product name..."
                      value={newFlashcard.word}
                      onChange={(e) =>
                        setNewFlashcard({
                          ...newFlashcard,
                          word: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-300 hover:bg-gray-100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium text-sm">
                      Price
                    </label>
                    <input
                      type="number"
                      placeholder="Enter price..."
                      step="0.01"
                      min="0"
                      value={newFlashcard.answer}
                      onChange={(e) =>
                        setNewFlashcard({
                          ...newFlashcard,
                          answer: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-300 hover:bg-gray-100"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium text-sm">
                      Category
                    </label>
                    <select
                      value={newFlashcard.category}
                      onChange={(e) =>
                        setNewFlashcard({
                          ...newFlashcard,
                          category: e.target.value as
                            | "Electronics"
                            | "Clothing"
                            | "Home"
                            | "Books",
                        })
                      }
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 transition-all duration-300 hover:bg-gray-100"
                    >
                      <option value="Electronics">📱 Electronics</option>
                      <option value="Clothing">👕 Clothing</option>
                      <option value="Home">🏠 Home & Garden</option>
                      <option value="Books">📚 Books</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium text-sm">
                      Price Range
                    </label>
                    <select
                      value={newFlashcard.difficulty}
                      onChange={(e) =>
                        setNewFlashcard({
                          ...newFlashcard,
                          difficulty: e.target.value as
                            | "Budget"
                            | "Standard"
                            | "Premium",
                        })
                      }
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 transition-all duration-300 hover:bg-gray-100"
                    >
                      <option value="Budget">Budget</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </div>
                  ) : (
                    "Add Product"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Products grid */}
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700 text-center mb-8">
              Your Products ({flashcards.length})
            </h2>
            {isLoading && flashcards.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {flashcards.map((flashcard, index) => (
                  <div
                    key={flashcard._id}
                    className="group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-80 bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 shadow-2xl hover:shadow-green-200/50 transition-all duration-300 group-hover:scale-105 relative flex flex-col">
                      {/* Action buttons */}
                      <div className="absolute top-4 right-4 flex space-x-2 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFlashcard(flashcard);
                          }}
                          className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200 shadow-lg"
                          title="Edit product"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingFlashcard(flashcard);
                          }}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 shadow-lg"
                          title="Delete product"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <span className="text-2xl">
                          {getCategoryIcon(flashcard.category)}
                        </span>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getDifficultyColor(
                            flashcard.difficulty
                          )} text-white`}
                        >
                          {flashcard.difficulty}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center items-center flex-1 text-center">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                          {flashcard.word}
                        </h3>
                        <p className="text-green-600 text-2xl font-bold mb-2">
                          ${flashcard.answer.toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                          {flashcard.category} • {flashcard.difficulty}
                        </p>
                      </div>

                      <div className="mt-auto">
                        <button
                          onClick={() => handleAddToCart(flashcard._id)}
                          disabled={addingToCart === flashcard._id}
                          className={`w-full text-white p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait font-semibold text-lg shadow-lg ${
                            addingToCart === flashcard._id
                              ? "bg-gradient-to-r from-blue-500 to-blue-600"
                              : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          }`}
                        >
                          {addingToCart === flashcard._id ? (
                            <span className="flex items-center justify-center">
                              <CheckCircle className="mr-2" size={20} /> Added
                              to Cart
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <ShoppingCart className="mr-2" size={20} /> Add to
                              Cart
                            </span>
                          )}
                        </button>

                        <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                          <span>
                            Added:{" "}
                            {new Date(flashcard.addedDay).toLocaleDateString()}
                          </span>
                          <span>
                            {flashcard.isMemorized
                              ? "✅ In Stock"
                              : "⏳ Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {flashcards.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">
                  No products yet
                </h3>
                <p className="text-gray-600">
                  Add your first product to get started!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingFlashcard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">
              Edit Product
            </h3>
            <form onSubmit={handleUpdateFlashcard} className="space-y-4">
              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editingFlashcard.word}
                  onChange={(e) =>
                    setEditingFlashcard({
                      ...editingFlashcard,
                      word: e.target.value,
                    })
                  }
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingFlashcard.answer}
                  onChange={(e) =>
                    setEditingFlashcard({
                      ...editingFlashcard,
                      answer: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-700 font-medium text-sm">
                    Category
                  </label>
                  <select
                    value={editingFlashcard.category}
                    onChange={(e) =>
                      setEditingFlashcard({
                        ...editingFlashcard,
                        category: e.target.value as
                          | "Electronics"
                          | "Clothing"
                          | "Home"
                          | "Books",
                      })
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                  >
                    <option value="Electronics">📱 Electronics</option>
                    <option value="Clothing">👕 Clothing</option>
                    <option value="Home">🏠 Home & Garden</option>
                    <option value="Books">📚 Books</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-gray-700 font-medium text-sm">
                    Price Range
                  </label>
                  <select
                    value={editingFlashcard.difficulty}
                    onChange={(e) =>
                      setEditingFlashcard({
                        ...editingFlashcard,
                        difficulty: e.target.value as
                          | "Budget"
                          | "Standard"
                          | "Premium",
                      })
                    }
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                  >
                    <option value="Budget">Budget</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingFlashcard(null)}
                  className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-2xl hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 font-medium"
                >
                  {isLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFlashcard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🗑️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Delete Product
              </h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this product?
              </p>
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <p className="font-semibold text-gray-800">
                  {deletingFlashcard.word}
                </p>
                <p className="text-gray-600">${deletingFlashcard.answer}</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setDeletingFlashcard(null)}
                  className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-2xl hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFlashcard}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 font-medium"
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ProductManager;
