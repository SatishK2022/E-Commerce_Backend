import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";


let db = await pool.getConnection();

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({
            success: false,
            status: 401,
            message: "Unauthorized! Token is missing"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const sql = "SELECT * FROM users WHERE id = ?";
        const params = [decoded.id];
        const [result] = await db.query(sql, params);
        const user = result[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: "Unauthorized! Invalid token"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(401).json({
            success: false,
            status: 401,
            message: "Error verifying token"
        });
    } finally {
        db.release();
    }
}

const isAdmin = async (req, res, next) => {
    const { role } = req.user;
    
    try {
        if (role !== "admin") {
            return res.status(403).json({
                success: false,
                status: 403,
                message: "Forbidden! You are not an admin"
            });
        }
        next();
    } catch (error) {
        console.error("Error while checking admin role", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error while checking admin role"
        })
    }
}

export {
    isLoggedIn,
    isAdmin
}