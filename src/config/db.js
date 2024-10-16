import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "@Satish2004",
    database: process.env.DB_NAME || "e_commerce",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        console.log("✅ Connected to MySQL database!");
        connection.release();
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
    }
};

export { pool, testConnection };