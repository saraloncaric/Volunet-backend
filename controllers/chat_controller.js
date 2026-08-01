import { pool } from "../db/db.js";

export const sviRazgovori = async(req, res) => {
    try {
        const { id: userId } = req.authUser;
        const razgovori = await pool.query(`
            SELECT *
            FROM conversations 
            WHERE user1_id = $1 OR user2_id = $1`, [userId]
        );
        res.status(200).json(razgovori.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });   
    }
}
export const noviRazgovor = async(req, res) => {
    try {
        const { id: user1_id } = req.authUser;
        const { user2_id } = req.body;

        const razgovorExists = await pool.query(`
            SELECT *
            FROM conversations
            WHERE (user1_id = $1 AND user2_id = $2) OR 
                (user1_id = $2 AND user2_id = $1)`, [user1_id, user2_id]
        );
        if (razgovorExists.rows.length > 0) {
            return res.status(200).json({ message: 'Razgovor već postoji', razgovor: razgovorExists.rows[0] });
        }
        const noviRazgovor = await pool.query(`
            INSERT INTO conversations (user1_id, user2_id)
            VALUES ($1, $2)
            RETURNING *`, [user1_id, user2_id]
        );
        res.status(201).json({ message: 'Razgovor uspješno kreiran', razgovor: noviRazgovor.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}