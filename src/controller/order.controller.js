import { pool } from "../config/db.js";

const createOrder = async (req, res) => {
    const { total_price, order_items } = req.body;

    console.log("total_price", total_price);
    console.log("order_items", order_items);

    let db;
    try {
        db = await pool.getConnection();

        await db.beginTransaction();

        const [result] = await db.query("INSERT INTO orders (user_id, total_price) VALUES (?, ?)", [req.user.id, total_price]);

        if (result.affectedRows === 0) {
            await db.rollback();
            return res.status(500).json({
                success: false,
                message: "Error while creating order",
                status: 500
            });
        }

        const orderId = result.insertId;

        for (const item of order_items) {
            const { id, quantity, totalPrice } = item;

            // Check if the product exists before inserting into order_items
            const [productExists] = await db.query("SELECT id FROM products WHERE id = ?", [id]);
            
            if (productExists.length === 0) {
                await db.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Product with id ${id} does not exist`,
                    status: 400
                });
            }

            await db.query("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", [orderId, id, quantity, totalPrice]);
        }

        await db.commit();

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            status: 201
        });
    } catch (error) {
        await db.rollback();
        console.error("Error while creating order", error);
        return res.status(500).json({
            success: false,
            message: "Error while creating order",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
}

const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    let db;
    try {
        db = await pool.getConnection();

        const [result] = await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
                status: 404
            })
        }

        return res.status(200).json({
            success: true,
            message: "Order updated successfully",
            status: 200
        })
    } catch (error) {
        console.error("Error while updating order", error);
        return res.status(500).json({
            success: false,
            message: "Error while updating order",
            status: 500
        })
    } finally {
        if (db) db.release();
    }
}

const getOrders = async (req, res) => {
    let db;
    try {
        db = await pool.getConnection();

        const [rawOrders] = await db.query(`
            SELECT o.id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at,
                   oi.id AS item_id, oi.quantity, oi.price AS item_price,
                   p.id AS product_id, p.name AS product_name, p.description AS product_description, 
                   p.price AS product_price, p.image AS product_image, p.category AS product_category, 
                   p.quantity AS product_quantity,
                   u.first_name AS user_first_name, u.last_name AS user_last_name, u.email AS user_email
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            JOIN users u ON o.user_id = u.id
            ORDER BY o.id
        `);

        if (rawOrders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found",
                status: 404
            });
        }

        const orders = rawOrders.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    id: row.id,
                    user_id: row.user_id,
                    user_name: row.user_name,
                    user_email: row.user_email,
                    total_price: row.total_price,
                    status: row.status,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    items: []
                };
            }
            acc[row.id].items.push({
                id: row.item_id,
                quantity: row.quantity,
                item_price: row.item_price,
                product: {
                    id: row.product_id,
                    name: row.product_name,
                    description: row.product_description,
                    price: row.product_price,
                    image: row.product_image,
                    category: row.product_category,
                    quantity: row.product_quantity
                }
            });
            return acc;
        }, {});

        return res.json({
            success: true,
            message: "Orders fetched successfully",
            status: 200,
            data: Object.values(orders)
        });
    } catch (error) {
        console.error("Error while fetching orders", error);
        return res.status(500).json({
            success: false,
            message: "Error while fetching orders",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
}

const getOrderById = async (req, res) => {
    const userId = req.user.id;

    let db;
    try {
        db = await pool.getConnection();

        const [rawOrders] = await db.query(`
            SELECT o.*, oi.id AS item_id, oi.product_id, oi.quantity, oi.price AS item_price, 
                   p.name AS product_name, p.description AS product_description, 
                   p.price AS product_price, p.image AS product_image, 
                   p.category AS product_category, p.quantity AS product_quantity
            FROM orders o 
            JOIN order_items oi ON o.id = oi.order_id 
            JOIN products p ON oi.product_id = p.id 
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [userId]);

        if (rawOrders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for this user",
                status: 404
            });
        }

        const orders = rawOrders.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    id: row.id,
                    user_id: row.user_id,
                    total_price: row.total_price,
                    status: row.status,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    items: []
                };
            }
            acc[row.id].items.push({
                id: row.item_id,
                product_id: row.product_id,
                product_name: row.product_name,
                product_description: row.product_description,
                quantity: row.quantity,
                price: row.item_price,
                product_price: row.product_price,
                product_image: row.product_image,
                product_category: row.product_category,
                product_quantity: row.product_quantity
            });
            return acc;
        }, {});

        return res.json({
            success: true,
            message: "Orders fetched successfully",
            status: 200,
            data: Object.values(orders)
        });
    } catch (error) {
        console.error("Error while fetching orders", error);
        return res.status(500).json({
            success: false,
            message: "Error while fetching orders",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
}

export { createOrder, updateOrder, getOrders, getOrderById };