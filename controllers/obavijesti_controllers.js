import { pool } from "../db/db.js";

export const dohvatiObavijesti = async(req, res) => {
    try {
        const { id } = req.authUser;
        const obavijesti = await pool.query(`
            SELECT * 
            FROM notifications
            WHERE user_id = $1
            ORDER BY sent_at DESC`, [id]
        );
        if(obavijesti.rows.length === 0) {
            return res.status(404).json({ message: 'Nema niti jedne obavijesti' });
        }
        res.status(200).json(obavijesti.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const oznaciProcitano = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser
        const obavijestExists = await pool.query(`
            SELECT * 
            FROM notifications
            WHERE id = $1`, [id]
        );
        if(obavijestExists.rows.length === 0) {
            return res.status(404).json({ message: 'Obavijest nije pronađena' });
        }
        console.log('user_id iz baze:', obavijestExists.rows[0].user_id, typeof obavijestExists.rows[0].user_id);
        console.log('userId iz tokena:', userId, typeof userId);
        if(obavijestExists.rows[0].user_id !== parseInt(userId)) {
            return res.status(403).json({ message: 'Nemate pristup ovoj obavijesti' });
        }
        await pool.query(`
            UPDATE notifications
            SET is_read = true
            WHERE id = $1`, [id]
        );
        res.status(200).json({ message: 'Obavijest pročitana' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}