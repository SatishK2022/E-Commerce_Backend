import express from "express";
import { createOrder, updateOrder, getOrders, getOrderById } from "../controller/order.controller.js";
import { isLoggedIn, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router
    .route("/")
    .post(isLoggedIn, createOrder)
    .get(isLoggedIn, isAdmin, getOrders);

router
    .route("/me")
    .get(isLoggedIn, getOrderById);

router
    .route("/:id")
    .patch(isLoggedIn, isAdmin, updateOrder);

export default router;