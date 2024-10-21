import express from "express";
import { forgotPassword, login, logout, profile, register, resetPassword, updateProfile, verifyOTP } from "../controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();

router
    .route("/register")
    .post(register);

router
    .route("/login")
    .post(login);

router
    .route("/logout")
    .get(logout);

router
    .route("/profile")
    .get(isLoggedIn, profile)

router
    .route("/update-profile")
    .put(isLoggedIn, updateProfile);

router
    .route("/forgot-password")
    .post(forgotPassword);

router
    .route("/verify-otp")
    .post(verifyOTP);

router
    .route("/reset-password")
    .post(resetPassword);

export default router