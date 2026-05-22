import { pool } from "../db/db.js";

export const dodajRecenziju = async(req, res) => {
    try {
        const { volunteer_id } = req.params;
        const { id: userId } = req.authUser;
        const { rating, comment, task_id } = req.body;
        if(rating > 1 || rating < 5) {
            return res.status(404).json({ message: 'Ocjena mora biti između 1 i 5' });
        }
        const volonter = await pool.query(`
            SELECT id 
            FROM volunteer_profiles 
            WHERE id = $1`, [volunteer_id]
        );
        if (volonter.rowa.length === 0) {
            return res.status(404).json({ message: 'Volonter nije pronađen' });
        }
        const udruga = await pool.query(`
            SELECT * 
            FROM organization_profiles
            WHERE user_id = $1`, { userId}
        );
        if(udruga.rows.length === 0) {
            return res.status(404).json({ message: 'Udruga nije pronađena' });
        }
        const organization_id = udruga.rows[0].id;
        const zavrsenZadatak = await pool.query(`
            SELECT ta.id
            FROM task_applications ta
            JOIN tasks t ON ta.task_id = t.id
            WHERE ta.volunteer_id = $1 AND t.organization_id = $2 AND ta.task_id = $3 AND ta.status = 'zavrsen'`,
            [volunteer_id, organization_id, task_id]
        );
        if(zavrsenZadatak.rows.length === 0) {
            return res.status(400).json({ message: 'Ne možete ostaviti recenziju' });
        }
        const postojiRecenzija = await pool.query(`
            SELECT id
            FROM volunteer_profiles
            WHERE volunteer_id = $1 AND organization_id = $2 AND task_id = $3`, 
            [volunteer_id, organization_id, task_id]
        );
        if(postojiRecenzija.rows.length > 0) {
            return res.status(400).json({ message: 'Recenzija već postoji' });
        }
        const recenzija = await pool.query(`
            INSERT INTO volunteer_reviews (volunteer_id, organization_id, task_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`, [ volunteer_id, organization_id, task_id, rating, comment]
        );
        res.status(201).json({ message: 'Recenzija uspješno dodana', recenzija: recenzija.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const dohvatiRecenzije = async(req, res) => {
    try {
        const { volunteer_id } = req.params;
        const recenzije = await pool.query(`
            SELECT * 
            FROM volunteer_reviews
            WHERE volunteer_id = $1 AND is_deleted = false`, [volunteer_id]
        );
        if(recenzije.rows.length === 0) {
            return res.status(404).json({ message: 'Volonter nema recenzije' });
        }
        res.status(200).json(recenzije.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const obrisiRecenziju = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser;
        const recenzijaPostoji = await pool.query(`
            SELECT * 
            FROM volunteer_reviews
            WHERE id = $1`, [id]
        );
        if(recenzijaPostoji.rows.length === 0) {
            return res.status(404).json({ message: 'Recenzija ne postoji' });
        }
        await pool.query(`
            UPDATE volunteer_reviews
            SET is_deleted = true, deleted_by = $1
            WHERE id = $2`, [userId, id]
        );
        res.status(200).json({ message: 'Recenzija uspješno obrisana' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}