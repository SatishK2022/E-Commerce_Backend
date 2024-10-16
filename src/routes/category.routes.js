import express from "express";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controller/category.controller.js";
import { isAdmin, isLoggedIn } from "../middleware/auth.middleware.js";
const router = express.Router();


router
    .route("/")
    .post(isLoggedIn, isAdmin, createCategory)
    .get(getCategories)

router
    .route("/:id")
    .put(isLoggedIn, isAdmin, updateCategory)
    .delete(isLoggedIn, isAdmin, deleteCategory)
    .get(getCategoryById)

export default router;