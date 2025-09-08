const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
} = require("../controllers/cartController");

router.post("/cart", addToCart);
router.get("/cart", getCart);
router.put("/cart/items/:id", updateCartItem);
router.delete("/cart/items/:id", deleteCartItem);

module.exports = router;
