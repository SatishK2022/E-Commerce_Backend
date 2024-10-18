import express from "express";
import { addToCart, getCart, updateCartItem, removeFromCart } from "../controller/cart.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();

router
    .route("/")
    .get(isLoggedIn, getCart)

router
    .route("/:product_id")
    .post(isLoggedIn, addToCart)

router
    .route("/:product_id")
    .delete(isLoggedIn, removeFromCart);

router
    .route("/:product_id")
    .put(isLoggedIn, updateCartItem)

export default router;