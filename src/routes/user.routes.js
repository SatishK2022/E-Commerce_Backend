import express from "express";
import { forgotPassword, login, logout, register, resetPassword, verifyOTP } from "../controller/user.controller.js";

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
    .route("/forgot-password")
    .post(forgotPassword);

router
    .route("/verify-otp")
    .post(verifyOTP);

router
    .route("/reset-password")
    .post(resetPassword);

export default router