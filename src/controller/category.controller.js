import { pool } from "../config/db.js";

let db = await pool.getConnection();

const createCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        const sql = "SELECT * FROM categories WHERE name = ?";
        const params = [name];
        const [result] = await db.query(sql, params);

        if (result.length > 0) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Category already exists",
            })
        }

        const sql1 = "INSERT INTO categories (name, description) VALUES (?, ?)";
        const params1 = [name, description];
        const [result1] = await db.query(sql1, params1);

        if (result1.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Error while creating category",
            })
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Category created successfully",
        })
    } catch (error) {
        console.error("Error while creating category", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error while creating category",
        })
    } finally {
        db.release();
    }
}

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const sql = "UPDATE categories SET name = ?, description = ? WHERE id = ?";
        const params = [name, description, id];
        const [result] = await db.query(sql, params);
        
        if (result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Error while updating category",
            })
        }
        
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Category updated successfully",
        })
    } catch (error) {
        console.error("Error while updating category", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error while updating category",
        })
    } finally {
        db.release();
    }
}

const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = "DELETE FROM categories WHERE id = ?";
        const params = [id];
        const [result] = await db.query(sql, params);
        
        if (result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Error while deleting category",
            })
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Category deleted successfully",
        })
    } catch (error) {
        console.error("Error while deleting category", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error while deleting category",
        })
    } finally {
        db.release();
    }
}

const getCategories = async (req, res) => {
    try {
        const sql = "SELECT * FROM categories";
        const [result] = await db.query(sql);

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Categories fetched successfully",
            data: result,
        })
    } catch (error) {
        console.error("Error while fetching categories", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error while fetching categories",
        })
    } finally {
        db.release();
    }
}

const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = "SELECT * FROM categories WHERE id = ?";
        const params = [id];
        const [result] = await db.query(sql, params);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Category not found",
            })
        }
        
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Category fetched successfully",
            data: result[0],
        })
    } catch (error) {
        console.error("Error while fetching category by id", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error while fetching category by id",
        })
    } finally {
        db.release();
    }
}

export {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategories,
    getCategoryById,
};
