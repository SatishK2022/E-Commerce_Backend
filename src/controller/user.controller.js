import asyncHandler from "../utils/asyncHandler.js"
import { pool } from "../config/db.js";
import { comparePassword, generateToken, hashPassword } from "../utils/helper.js";
import sendEmail from "../utils/sendEmail.js";

let db = await pool.getConnection();

const register = asyncHandler(async (req, res) => {
    const { first_name, last_name, email, password, phone_number, date_of_birth } = req.body;

    try {
        const sql1 = "SELECT * FROM users WHERE email = ?";
        const params1 = [email];
        const [result] = await db.query(sql1, params1);

        if (result.length > 0) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "User already exists",
            })
        }

        const sql2 = "INSERT INTO users (first_name, last_name, email, password, phone_number, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)";
        const hashedPassword = await hashPassword(password);
        const params2 = [first_name, last_name, email, hashedPassword, phone_number, date_of_birth];
        const [result2] = await db.query(sql2, params2);

        if (result2.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Error registering user",
            })
        }

        return res.status(201).json({
            success: true,
            status: 201,
            message: "User registered successfully",
        })
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error registering user",
        })
    } finally {
        db.release();
    }
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        const params = [email];
        const [result] = await db.query(sql, params);

        if (result.length === 0) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "User not found",
            })
        }

        const user = result[0];
        const hashedPassword = result[0].password;
        const isMatch = await comparePassword(password, hashedPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Invalid password",
            })
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        const cookieOptions = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("token", token, cookieOptions)
            .json({
                success: true,
                status: 200,
                message: "Logged in successfully",
            })

    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error logging in",
        })
    } finally {
        db.release();
    }
})

const logout = asyncHandler(async (req, res) => {
    try {
        return res
            .status(200)
            .clearCookie("token")
            .json({
                success: true,
                status: 200,
                message: "Logged out successfully",
            })
    } catch (error) {
        console.error("Error logging out:", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error logging out",
        })
    }
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        const params = [email];
        const [result] = await db.query(sql, params);
        
        const user = result[0];

        if (!user) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "User not found",
            })
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpires = new Date(Date.now() + 5 * 60000);

        const sql2 = "UPDATE users SET otp = ?, otpExpires = ? WHERE email = ?";
        const params2 = [otp, otpExpires, email];
        const [result2] = await db.query(sql2, params2);

        if (result2.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Error while updating OTP",
            })
        }

        await sendEmail(email, "Forgot Password", `Your OTP is ${otp}`);

        return res.status(200).json({
            success: true,
            status: 200,
            message: "OTP sent successfully",
        })
    } catch (error) {
        console.error("Error while forgetting password", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error while forgetting password",
        })
    } finally {
        db.release();
    }
})

const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        const params = [email];
        const [result] = await db.query(sql, params);

        const user = result[0];

        if (!user) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "User not found",
            })
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Invalid OTP",
            })
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "OTP expired",
            })
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "OTP verified successfully",
        })
    } catch (error) {
        console.error("Error while verifying OTP", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error while verifying OTP",
        })
    } finally {
        db.release();
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await hashPassword(password);
        const sql = "UPDATE users SET password = ? WHERE email = ?";
        const params = [hashedPassword, email];
        const [result] = await db.query(sql, params);
        
        if (result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Error while resetting password",
            })
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Password reset successfully",
        })
    } catch (error) {
        console.error("Error while resetting password", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error while resetting password",
        })
    } finally {
        db.release();
    }
})

export {
    register,
    login,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword
}