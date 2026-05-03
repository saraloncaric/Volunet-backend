import { pool } from "../db/db.js";

export const dohvatiSveZadatke = async(req, res) => {
    try {
        const zadaci = await pool.query(`
            SELECT * 
            FROM tasks 
            WHERE id = $1 
            ORDER BY created_at DESC`, [id]
        );
        res.status(200).json(zadaci.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}