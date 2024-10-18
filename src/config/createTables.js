import { pool } from "./db.js";

async function createTables() {
    const userTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        avatar VARCHAR(255),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(15) NOT NULL,
        date_of_birth DATE NOT NULL,
        role VARCHAR(255) NOT NULL DEFAULT 'user',
        otp VARCHAR(6),
        otpExpires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    )`

    const categoryTable = `
    CREATE TABLE IF NOT EXISTS categories (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    )`

    const productTable = `
    CREATE TABLE IF NOT EXISTS products (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        price INT NOT NULL,
        image VARCHAR(255),
        category INT NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (category) REFERENCES categories(id)
    )`

    const cartTable = `
    CREATE TABLE IF NOT EXISTS cart (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        total_price INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`

    const cartItemTable = `
    CREATE TABLE IF NOT EXISTS cart_items (
        id INT NOT NULL AUTO_INCREMENT,
        cart_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (cart_id) REFERENCES cart(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )`

    try {
        const connection = await pool.getConnection();

        await connection.query(userTable);
        await connection.query(categoryTable);
        await connection.query(productTable);
        await connection.query(cartTable);
        await connection.query(cartItemTable);

        console.log("Tables created successfully!");
        connection.release();
    } catch (error) {
        console.error("Error creating tables:", error);
    }
}

export default createTables;