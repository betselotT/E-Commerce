const Cart = require("../models/Cart");
const Flashcard = require("../models/Flashcard");
const { protect } = require("../middleware/authMiddleware");

exports.addToCart = [
  protect,
  async (req, res) => {
    const { flashcardId, quantity } = req.body;
    const userId = req.userId;

    try {
      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const flashcard = await Flashcard.findById(flashcardId);
      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.flashcardId.toString() === flashcardId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity || 1;
      } else {
        cart.items.push({ flashcardId, quantity: quantity || 1 });
      }

      await cart.save();
      const populatedCart = await Cart.findOne({ userId }).populate(
        "items.flashcardId"
      );
      res.status(200).json(populatedCart);
    } catch (err) {
      console.error("AddToCart error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
];

exports.getCart = [
  protect,
  async (req, res) => {
    const userId = req.userId;

    try {
      const cart = await Cart.findOne({ userId }).populate("items.flashcardId");
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      res.json(cart);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
];

exports.updateCartItem = [
  protect,
  async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.userId;

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === id
      );

      if (itemIndex > -1) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }
      } else {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      await cart.save();
      const populatedCart = await Cart.findOne({ userId }).populate(
        "items.flashcardId"
      );
      res.json(populatedCart);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
];

exports.deleteCartItem = [
  protect,
  async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === id
      );

      if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
      } else {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      await cart.save();
      const populatedCart = await Cart.findOne({ userId }).populate(
        "items.flashcardId"
      );
      res.json(populatedCart);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
];
