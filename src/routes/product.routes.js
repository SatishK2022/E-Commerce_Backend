import express from "express"
import { addProduct, deleteProduct, getProductByCategory, getProductById, getProducts, updateProduct } from "../controller/product.controller.js";
import { isAdmin, isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
const router = express.Router();

router
    .route('/')
    .post(isLoggedIn, isAdmin, upload.single('image'), addProduct)
    .get(getProducts)

router
    .route('/:id')
    .put(isLoggedIn, isAdmin, upload.single('image'), updateProduct)
    .delete(isLoggedIn, isAdmin, deleteProduct)
    .get(getProductById)

router
    .route("/category/:id")
    .get(getProductByCategory)

export default router;