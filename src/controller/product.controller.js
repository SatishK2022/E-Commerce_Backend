import { pool } from "../config/db.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

const addProduct = async (req, res) => {
    let db;
    try {
        const { name, description, price, category, quantity } = req.body;
        const image = req.file?.path;

        db = await pool.getConnection();

        // Get category ID
        const [categoryResult] = await db.query(
            "SELECT id FROM categories WHERE name = ?",
            [category]
        );

        if (categoryResult.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid category",
                status: 400
            });
        }

        // Insert product
        const [result] = await db.query(
            `INSERT INTO products (name, description, price, image, category, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description, price, null, categoryResult[0].id, quantity]
        );

        // Upload image if provided
        if (image) {
            const imageUrl = await cloudinary.uploader.upload(image, {
                folder: "products"
            });

            await db.query(
                `UPDATE products SET image = ? WHERE id = ?`,
                [imageUrl.secure_url, result.insertId]
            );

            await fs.unlink(`./public/${req.file.filename}`);
        }

        return res.json({
            success: true,
            message: "Product added successfully",
            status: 201
        });
    } catch (error) {
        console.error("Error adding product", error);
        return res.status(500).json({
            success: false,
            message: "Error adding product",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
};

const updateProduct = async (req, res) => {
    let db;
    try {
        const { id } = req.params;
        const { name, description, price, category, quantity } = req.body;
        const image = req.file;

        db = await pool.getConnection();

        const [product] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

        if (product.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                status: 404
            });
        }

        const [categoryResult] = await db.query(
            "SELECT id FROM categories WHERE name = ?",
            [category]
        );

        if (categoryResult.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid category",
                status: 400
            });
        }

        await db.query(
            `UPDATE products SET name = ?, description = ?, price = ?, category = ?, quantity = ? WHERE id = ?`,
            [name, description, Number(price), categoryResult[0].id, Number(quantity), id]
        );

        if (image) {
            const imageUrl = await cloudinary.uploader.upload(image.path, {
                folder: "products"
            });

            await db.query(
                `UPDATE products SET image = ? WHERE id = ?`,
                [imageUrl.secure_url, id]
            );

            await fs.unlink(`./public/${image.filename}`);
        }

        return res.json({
            success: true,
            message: "Product updated successfully",
            status: 200
        });
    } catch (error) {
        console.error("Error updating product", error);
        return res.status(500).json({
            success: false,
            message: "Error updating product",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
}

const deleteProduct = async (req, res) => {
    let db;
    try {
        const { id } = req.params;

        db = await pool.getConnection();

        const [product] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

        if (product.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                status: 404
            });
        }

        await db.query("DELETE FROM products WHERE id = ?", [id]);

        return res.json({
            success: true,
            message: "Product deleted successfully",
            status: 200
        });
    } catch (error) {
        console.error("Error deleting product", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting product",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
}

const getProducts = async (req, res) => {
    let db;
    try {
        db = await pool.getConnection();

        const [products] = await db.query("SELECT p.*, c.name as category FROM products p JOIN categories c ON p.category = c.id");

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found",
                status: 404
            });
        }

        return res.json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            status: 200
        });
    } catch (error) {
        console.error("Error fetching products", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching products",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
}

const getProductById = async (req, res) => {
    let db;
    try {
        const { id } = req.params;

        db = await pool.getConnection();

        const [result] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

        return res.json({
            success: true,
            status: 200,
            data: result,
            message: "Product fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching product", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching product",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
}

const getProductByCategory = async (req, res) => {
    let db;
    try {
        const { id } = req.params;

        db = await pool.getConnection();

        const [result] = await db.query("SELECT * FROM products WHERE category = ?", [id]);

        return res.json({
            success: true,
            status: 200,
            data: result,
            message: "Products fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching product by category", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching product by category",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
}

export { addProduct, getProducts, updateProduct, deleteProduct, getProductById, getProductByCategory };