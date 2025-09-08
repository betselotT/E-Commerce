"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Cart } from "@/app/types/cart";
import { ArrowLeft, Trash2 } from "lucide-react";

const CartPage = () => {
  const params = useParams();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        router.push("/sign-in");
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cart`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCart(data);
        } else if (response.status === 404) {
          setCart({
            _id: "",
            userId: params.id as string,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          setError("Failed to load cart");
        }
      } catch (err) {
        setError("Server error while fetching cart");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [token, router, params.id]);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!token || quantity < 1) return;
    setUpdatingItemId(itemId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        }
      );
      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        setError("Failed to update quantity");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!token) return;
    setUpdatingItemId(itemId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/items/${itemId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        setError("Failed to delete item");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const totalPrice = useMemo(() => {
    return (
      cart?.items.reduce((total, item) => {
        if (item.flashcardId && typeof item.flashcardId.answer === "number") {
          return total + item.flashcardId.answer * item.quantity;
        }
        return total;
      }, 0) || 0
    );
  }, [cart]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <Link
              href={`/flashcards/${params.id}`}
              className="flex items-center text-green-600 hover:text-green-800 transition-colors duration-300 group"
            >
              <ArrowLeft className="w-6 h-6 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-semibold">Back to Shop</span>
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              Your Cart
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-center">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-8xl mb-4">🛒</div>
              <h3 className="text-3xl font-bold text-green-700 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-600">
                Looks like you haven't added anything to your cart yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center mb-4 sm:mb-0 flex-1">
                      <div className="text-4xl mr-4">
                        {{
                          Electronics: "📱",
                          Clothing: "👕",
                          Home: "🏠",
                          Books: "📚",
                        }[item.flashcardId?.category] || "📦"}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">
                          {item.flashcardId?.word || "Unknown Product"}
                        </h4>
                        <p className="text-gray-600 text-base">
                          $
                          {item.flashcardId?.answer
                            ? item.flashcardId.answer.toFixed(2)
                            : "0.00"}{" "}
                          each
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.flashcardId?.category || "Unknown Category"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600 font-medium">
                          Qty:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item._id,
                              Number.parseInt(e.target.value)
                            )
                          }
                          disabled={updatingItemId === item._id}
                          className="w-20 p-2 text-center bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                        />
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-gray-800">
                          $
                          {item.flashcardId?.answer
                            ? (item.flashcardId.answer * item.quantity).toFixed(
                                2
                              )
                            : "0.00"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={updatingItemId === item._id}
                        className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 disabled:opacity-50"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl">
                  <h3 className="text-2xl font-bold text-green-700 mb-6">
                    Order Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>FREE</span>
                    </div>
                    <div className="border-t border-gray-200 my-4"></div>
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <button className="w-full mt-8 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
