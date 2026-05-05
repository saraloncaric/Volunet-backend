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
export const jedanZadatak = async(req, res) => {
    try {
        const { id } = req.params;
        const zadatak = await pool.query(`
            SELECT * 
            FROM tasks 
            WHERE id = $1`, [id]
        );
        res.status(200).json(zadatak.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const noviZadatak = async(req, res) => {
    try {
        const { id } = req.authUser;
        const { title, category_id, description, location, start_date, end_date, start_time, max_volunteers, is_urgent } = req.body;
        if(!title || !category_id || !description || !location || !start_date || !end_date || !start_time || !max_volunteers) {
            return res.status(400).json({ message: 'Sva polja su obvezna' });
        }
        const udruga = await pool.query(`
            SELECT id
            FROM organization_profiles
            WHERE user_id = $1`, [id]
        );
        if(udruga.rows.length === 0) {
            return res.status(404).json({ message: 'Udruga nije pronađena' });
        }
        const organization_id = udruga.rows[0].id;
        const noviZad = await pool.query(`
            INSERT INTO tasks (organization_id, category_id, title, description, location, start_date, end_date, start_time, max_volunteers, is_urgent)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`, [organization_id, category_id, title, description, location, start_date, end_date, start_time, max_volunteers, is_urgent ?? false] 
        );
        res.status(201).json({ message: 'Zadatak uspješno dodan', zadatak: noviZad.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const urediZadatak = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser;
        const { title, category_id, description, location, start_date, end_date, start_time, max_volunteers, is_urgent } = req.body;
    
        const zadatak = await pool.query(`
            SELECT * 
            FROM tasks
            WHERE id = $1`, [id]
        );
        if(zadatak.rows.length === 0) {
            return res.status(404).json({ message: 'Zadatak nije pronađen' });
        }
        const udruga = await pool.query(`
            SELECT id
            FROM organization_profiles
            WHERE user_id = $1`, [userId]
        );
        if(udruga.rows.length === 0) {
            return res.status(404).json({ message: 'Udruga nije pronađena' });
        }
        const organization_id = udruga.rows[0].id;
        if(zadatak.rows[0].organization_id !== organization_id) {
            return res.status(403).json({ message: 'Nemate pristup ovom zadatku' });
        }
        const azurirano = await pool.query(`
            UPDATE tasks
            SET title = COALESCE($1, title),
                category_id = COALESCE($2, category_id),
                description = COALESCE($3, description),
                location = COALESCE($4, location),
                start_date = COALESCE($5, start_date),
                end_date = COALESCE($6, end_date),
                start_time = COALESCE($7, start_time),
                max_volunteers = COALESCE($8, max_volunteers),
                is_urgent = COALESCE($9, is_urgent)
            WHERE id = $10
            RETURNING *`, [title, category_id, description, location, start_date, end_date, start_time, max_volunteers, is_urgent, id]
        );
        res.status(200).json({ message: 'Zadatak uspješno ažuriran', zadatak: azurirano.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const deleteZadatak = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser;
        const zadatak = await pool.query(`
            SELECT * 
            FROM tasks
            WHERE id = $1`, [id]
        );
        if(zadatak.rows.length === 0) {
            return res.status(404).json({ message: 'Zadatak nije pronađen' });
        }
        if(req.authUser.role !== 'admin') {
            const udruga = await pool.query(`
                SELECT id
                FROM organization_profiles
                WHERE user_id = $1`, [userId]
            );
            if(udruga.rows.length === 0) {
                return res.status(404).json({ message: 'Udruga nije pronađena' });
            }
            const organization_id = udruga.rows[0].id;
            if(zadatak.rows[0].organization_id !== organization_id) {
                return res.status(403).json({ message: 'Nemate pristup za brisanje zadatka' });
            }
        }
        await pool.query(`
            DELETE FROM tasks
            WHERE id = $1`, [id]
        );
        res.status(200).json({ message: 'Zadatak uspješno obrisan' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const oznaciZadatakZavrsenim = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser;
        const zadatak = await pool.query(`
            SELECT * 
            FROM tasks
            WHERE id = $1`, [id]
        );
        if(zadatak.rows.length === 0) {
            return res.status(404).json({ message: 'Zadatak nije pronađen' });
        }
        const udruga = await pool.query(`
            SELECT id
            FROM organization_profiles
            WHERE user_id = $1`, [userId]
        );
        const organization_id = udruga.rows[0].id;
        if(zadatak.rows[0].organization_id !== organization_id) {
            return res.status(403).json({ message: 'Nemate pristup zadatku' });
        }
        const promjenjeno = await pool.query(`
            UPDATE tasks
            SET status = 'zavrsen'
            WHERE id = $1
            RETURNING *`, [id]
        );
        res.status(200).json({ message: 'Status zadatka uspješno promjenjen', zadatak: promjenjeno.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}