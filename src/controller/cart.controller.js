import { pool } from "../config/db.js";

const addToCart = async (req, res) => {
    const product_id = req.params.product_id;
    const user_id = req.user.id;

    let db;
    try {
        db = await pool.getConnection();

        const [product] = await db.query("SELECT id, price, quantity FROM products WHERE id = ?", [product_id]);

        if (product.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                status: 404
            });
        }

        const productPrice = product[0].price;
        const availableQuantity = product[0].quantity;

        const [existingCart] = await db.query("SELECT id FROM cart WHERE user_id = ?", [user_id]);

        let cart_id;

        if (existingCart.length === 0) {
            const [newCart] = await db.query("INSERT INTO cart (user_id, total_price) VALUES (?, 0)", [user_id]);
            cart_id = newCart.insertId;
        } else {
            cart_id = existingCart[0].id;
        }

        const [existingCartItem] = await db.query("SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?", [cart_id, product_id]);

        let newQuantity;

        if (existingCartItem.length === 0) {
            newQuantity = 1;
            await db.query("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)", [cart_id, product_id, newQuantity]);
        } else {
            newQuantity = existingCartItem[0].quantity + 1;
            if (newQuantity > availableQuantity) {
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity exceeds available stock",
                    status: 400
                });
            }
            await db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [newQuantity, existingCartItem[0].id]);
        }

        await db.query("UPDATE cart SET total_price = (SELECT SUM(p.price * ci.quantity) FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?) WHERE id = ?", [cart_id, cart_id]);

        return res.status(201).json({
            success: true,
            message: "Product added to cart",
            status: 201,
        });
    } catch (error) {
        console.error("Error adding to cart", error);
        return res.status(500).json({
            success: false,
            message: "Error adding to cart",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
};

const getCart = async (req, res) => {
    const user_id = req.user.id;

    let db;
    try {
        db = await pool.getConnection();

        const [cart] = await db.query("SELECT * FROM cart WHERE user_id = ?", [user_id]);

        if (cart.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
                status: 404
            })
        }

        const cart_id = cart[0].id;

        const [cartItems] = await db.query(`
            SELECT ci.*, p.name, p.description, p.price, p.image
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `, [cart_id]);

        return res.status(200).json({
            success: true,
            message: "Cart retrieved",
            status: 200,
            data: {
                cart: cart[0],
                items: cartItems
            }
        })
    } catch (error) {
        console.error("error getting cart", error);
        return res.status(500).json({
            success: false,
            message: "Error getting cart",
            status: 500
        })
    } finally {
        if (db) db.release();
    }
}

const updateCartItem = async (req, res) => {
    const product_id = req.params.product_id;
    const user_id = req.user.id;
    const { quantity } = req.body;

    let db;
    try {
        db = await pool.getConnection();

        console.log(product_id, user_id, quantity);

        const [cart] = await db.query("SELECT * FROM cart WHERE user_id = ?", [user_id]);

        if (cart.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
                status: 404
            });
        }

        const cart_id = cart[0].id;

        const [cartItem] = await db.query("SELECT ci.*, p.name, p.price, p.quantity AS available_quantity FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ? AND ci.product_id = ?", [cart_id, product_id]);

        if (cartItem.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
                status: 404
            });
        }

        const cartItem_id = cartItem[0].id;

        // Check if the requested quantity is available
        if (quantity > cartItem[0].available_quantity) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock",
                status: 400
            });
        }

        // Update the cart item quantity
        await db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, cartItem_id]);

        // Update the cart's total price
        await db.query(`
            UPDATE cart 
            SET total_price = (
                SELECT COALESCE(SUM(p.price * ci.quantity), 0)
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.cart_id = ?
            )
            WHERE id = ?
        `, [cart_id, cart_id]);

        const [updatedCart] = await db.query("SELECT * FROM cart WHERE id = ?", [cart_id]);
        const [updatedCartItems] = await db.query("SELECT ci.*, p.name, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?", [cart_id]);

        return res.status(200).json({
            success: true,
            message: "Cart item updated",
            status: 200,
            data: {
                cart: updatedCart[0],
                items: updatedCartItems
            }
        });
    } catch (error) {
        console.error("Error updating cart item", error);
        return res.status(500).json({
            success: false,
            message: "Error updating cart item",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
};

const removeFromCart = async (req, res) => {
    const product_id = req.params.product_id;
    const user_id = req.user.id;

    let db;
    try {
        db = await pool.getConnection();

        const [cart] = await db.query("SELECT * FROM cart WHERE user_id = ?", [user_id]);

        if (cart.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
                status: 404
            });
        }

        const cart_id = cart[0].id;

        const [cartItem] = await db.query("SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?", [cart_id, product_id]);

        if (cartItem.length === 0) {
            // Instead of returning an error, we'll log a warning and continue
            console.warn(`Cart item not found for cart_id ${cart_id} and product_id ${product_id}`);
        } else {
            const cartItem_id = cartItem[0].id;
            await db.query("DELETE FROM cart_items WHERE id = ?", [cartItem_id]);
        }

        // Update the cart's total price
        await db.query(`
            UPDATE cart 
            SET total_price = (
                SELECT COALESCE(SUM(p.price * ci.quantity), 0)
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.cart_id = ?
            )
            WHERE id = ?
        `, [cart_id, cart_id]);

        const [updatedCart] = await db.query("SELECT * FROM cart WHERE id = ?", [cart_id]);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            status: 200,
        });
    } catch (error) {
        console.error("Error updating cart", error);
        return res.status(500).json({
            success: false,
            message: "Error updating cart",
            status: 500
        });
    } finally {
        if (db) db.release();
    }
}

export {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart
}