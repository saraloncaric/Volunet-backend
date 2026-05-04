import { pool } from "../db/db.js";

export const dohvatiSveZadatke = async(req, res) => {
    try {
        const zadaci = await pool.query(`
            SELECT * 
            FROM tasks 
            WHERE 1 = 1 
            ORDER BY created_at DESC`
        );
        res.status(200).json(zadaci.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const zadaciFilter = async(req, res) => {
    try {
        const { category_id, location, start_date } = req.query;
        let query = `
            SELECT t.*, tc.name AS category_name, op.name AS organitaion_name
            FROM tasks t
            LEFT JOIN task_categories tc ON t.organization_id = tc.id
            LEFT JOIN organization_profiles op ON t.organization_id = op.id
            WHERE t.status = 'aktivan'
        `;
        let params = [];
        let brojac = 1;
        if(category_id) {
            query += ` AND t.category_id = $${brojac}}`;
            params.push(category_id);
            brojac++;
        }
        if(location) {
            query += ` AND t.location LIKE LOWER($${brojac})`;
            params.push(`%${location}%`);
            brojac++;
        }
        if(start_date) {
            query += ` AND t.start_date >= $${brojac}`;
            params.push(start_date);
            brojac++;
        }
        query += ` ORDER BY t.created_at DESC`;
        const filterZadaci = await pool.query(query, params);
        res.status(200).json(filterZadaci.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}