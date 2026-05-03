import { pool } from "../db/db.js";

export const dohvatiProfilVolontera = async(req, res) => {
    try {
        const { id } = req.params;
        const volonter = await pool.query(`
            SELECT *
            FROM volunteer_profiles
            WHERE id = $1`, [id]
        );
        res.json(volonter.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const urediProfil = async(req, res) => {
    try {
        const { id } = req.authUser;
        const { name, surname, bio, location, phone, profile_image } = req.body;
        const volonter = await pool.query('SELECT * FROM volunteer_profiles WHERE user_id = $1', [id]);
        if(volonter.rows.length === 0) {
            return res.status(404).json({ message: 'Volonter nije pronađen' });
        }
        const uređeno = await pool.query(`
            UPDATE volunteer_profiles
            SET name = COALESCE($1, name),
                surname = COALESCE($2, surname),
                bio = COALESCE($3, bio),
                location = COALESCE($4, location),
                phone = COALESCE($5, phone),
                profile_image = COALESCE($6, profile_image)
            WHERE user_id = $7
            RETURNING *`, [name, surname, bio, location, phone, profile_image, id]
        );
        res.json({ message: 'Profil volontera uspješno ažuriran', volonter: uređeno.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const povijestVolontiranja = async(req, res) => {
    try {
        const { id } = req.authUser;
        const zavrseniZadaci = await pool.query(`
            SELECT ta.*, t.title, t.location, t.start_date
            FROM task_applications ta
            JOIN tasks t ON ta.task_id = t.id
            WHERE ta.volunteer_id = (SELECT id FROM volunteer_profiles WHERE user_id = $1)
            AND ta.status = 'zavrsen'`, [id]
        );
        res.json(zavrseniZadaci.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}