import dotenv from "dotenv"
dotenv.config();
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser";
import createTables from "./config/createTables.js";
import { testConnection } from "./config/db.js";
import morgan from "morgan";

const app = express();

// Database Connection
testConnection();

// Create Tables
createTables();

// middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan("dev"))

// Routes Imports
import userRoutes from "./routes/user.routes.js"
import categoryRoutes from "./routes/category.routes.js"

// Routes Decleration
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/category", categoryRoutes)
// Home Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to E-Commerce API",
    })
})

// Catch all route to handle 404 errors
app.get("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Page not found"
    })
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`⚙️  Server running on http://localhost:${PORT}`);
})