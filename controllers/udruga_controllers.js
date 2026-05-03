import { pool } from "../db/db.js";

export const dohvatiProfilUdruge = async(req, res) => {
    try {
        const { id } = req.params;
        const udruga = await pool.query(`
            SELECT * FROM organization_profiles
            WHERE id = $1`, [id]
        );
        res.json(udruga.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const urediProfilUdruge = async(req, res) => {
    try {
        const { id } = req.authUser;
        const { name, description, location, website, phone, logo_image } = req.body;
        const udruga = await pool.query('SELECT * FROM organization_profiles WHERE user_id = $1', [id]);
        if (udruga.rows.length === 0) {
            return res.status(404).json({ message: 'Udruga nije pronađena' });
        }
        const uređeno = await pool.query(`
            UPDATE organization_profiles
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                location = COALESCE($3, location),
                website = COALESCE($4, website),
                phone = COALESCE($5, phone),
                logo_image = COALESCE($6, logo_image)
            WHERE user_id = $7
            RETURNING *`, [name, description, location, website, phone, logo_image, id]
        );
        res.status(200).json({ message: 'Profil udruge uspješno ažuriran', udruga: uređeno.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const dohvatiSveZadatke = async(req, res) => {
    try {
        const { id } = req.authUser;
        const udruga = await pool.query('SELECT * FROM organization_profiles WHERE user_id = $1', [id]);
        if (udruga.rows.length === 0) {
            return res.status(404).json({ message: 'Udruga nije pronađena' });
        }
        const zadaci = await pool.query(`
            SELECT * 
            FROM tasks
            WHERE organization_id = (SELECT id FROM organization_profiles WHERE user_id = $1)
            AND (status = 'aktivan' OR status = 'zavrsen')
            ORDER BY start_date DESC`, [id]
        );
        res.json(zadaci.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const dohvatiZadatak = async(req, res) => {
    try {
        const { id } = req.params;
        const zadatak = await pool.query(`
            SELECT *
            FROM tasks 
            WHERE id = $1`, [id]
        );
        if(zadatak.rows.length === 0) {
            return res.status(400).json({ message: 'Zadatak nije pronađen' });
        }
        res.status(200).json(zadatak.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const prijavljeniNaZadatak = async(req, res) => {
    try {
        const { id } = req.authUser;
        const prijavljeni = await pool.query(`
            SELECT vp.name, vp.surname, users.email, ta.status
            FROM task_applications ta
            JOIN volunteer_profiles vp ON ta.volunteer_id = vp.id
            JOIN users ON vp.user_id = users.id
            WHERE ta.task_id = $1`, [id]
        );
        res.json(prijavljeni.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}