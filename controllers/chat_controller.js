import { pool } from "../db/db.js";

export const sviRazgovori = async(req, res) => {
    try {
        const { id: userId } = req.authUser;
        const razgovori = await pool.query(`
            SELECT 
                c.id, 
                CASE
                    WHEN u.role = 'volonter'
                        THEN CONCAT(vp.name, ' ', vp.surname)
                    WHEN u.role = 'udruga'
                        THEN op.name
                    END AS name,
                CASE 
                    WHEN u.role = 'volonter' THEN 'volonter'
                    WHEN u.role = 'udruga' THEN 'udruga'
                END AS role,
                u.id AS user_id
            FROM conversations c
            JOIN users u ON u.id = CASE 
                WHEN c.user1_id = $1 THEN c.user2_id
                ELSE c.user1_id
            END
            LEFT JOIN volunteer_profiles vp ON vp.user_id = u.id
            LEFT JOIN organization_profiles op ON op.user_id = u.id
            WHERE c.user1_id = $1 OR c.user2_id = $1`, [userId]
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

        if(user1_id === user2_id) {
            return res.status(400).json({ message: 'Ne možete započeti razgovor sami sa sobom' });
        }
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
export const dohvatiPoruke = async(req, res) => {
    try {
        const { id: user_id } = req.authUser;
        const { conversation_id } = req.params;
        const razgovor = await pool.query(`
            SELECT * 
            FROM conversations
            WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`, [conversation_id, user_id]
        );
        if(razgovor.rows.length === 0) {
            return res.status(403).json({ message: 'Nemate pristup razgovoru' });
        }
        const poruke = await pool.query(`
            SELECT *
            FROM messages
            WHERE conversation_id = $1
            ORDER BY created_at ASC`, [conversation_id]
        );
        res.status(200).json(poruke.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const novaPoruka = async(req, res) => {
    try {
        const { id: sender_id } = req.authUser;
        const { conversation_id, content } = req.body;
        const razgovor = await pool.query(`
            SELECT * 
            FROM conversations
            WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`, [conversation_id, sender_id]
        );
        if(razgovor.rows.length === 0) {
            return res.status(403).json({ message: 'Nemate pristup razgovoru' });
        }
        const poruka = await pool.query(`
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES ($1, $2, $3)
            RETURNING *`, [conversation_id, sender_id, content]
        );
        res.status(201).json(poruka.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const readAt = async(req, res) => {
    try {
        const { conversation_id } = req.body;
        const { id: user_id } = req.authUser;

        const razgovor = await pool.query(`
            SELECT * 
            FROM conversations
            WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`, [conversation_id, user_id]
        );
        if(razgovor.rows.length === 0) {
            return res.status(403).json({ message: 'Nemate pristup razgovoru' });
        }

        const readAt = await pool.query(`
            UPDATE messages
            SET read_at = NOW()
            WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL`, [conversation_id, user_id]
        );
        res.status(201).json({ message: 'Poruka pročitana' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const deleteChat = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: user_id } = req.authUser;

        const chatExists = await pool.query(`
            SELECT * 
            FROM conversations 
            WHERE id = $1`, [id]
        );
        if(chatExists.rows.length === 0) {
            return res.status(404).json({ message: 'Razgovor nije pronađen' });
        }

        const razgovor = await pool.query(`
            DELETE FROM conversations
            WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`, [id, user_id]
        );
        if(razgovor.rowCount === 0) { 
            return res.status(403).json({ message: 'Nemate pristup ovom razgovoru' }); 
        }
        res.status(200).json({ message: 'Razgovor uspješno obrisan' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser;

        const messageExists = await pool.query(`
            SELECT m.id
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE m.id = $1 AND (c.user1_id = $2 OR c.user2_id = $2)`, [id, userId]
        );
        if(messageExists.rows.length === 0) {
            return res.status(404).json({ message: 'Poruka nije pronađena' });
        }
        await pool.query(`
            DELETE FROM messages
            WHERE id = $1`, [id]
        );
        res.status(200).json({ message: 'Poruka uspješno obrisana' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const traziKorisnike = async(req, res) => {
    try {
        const { query } = req.query;
        const { id: userId } = req.authUser;
        const korisnici = await pool.query(`
            SELECT u.id, u.role,
                CASE
                    WHEN u.role = 'volonter' THEN CONCAT(vp.name, ' ', vp.surname)
                    WHEN u.role = 'udruga' THEN op.name
                END AS name
            FROM users u
            LEFT JOIN volunteer_profiles vp ON vp.user_id = u.id
            LEFT JOIN organization_profiles op ON op.user_id = u.id
            WHERE u.id != $1 AND u.role != 'admin'
            AND (
                LOWER(CONCAT(vp.name, ' ', vp.surname)) LIKE LOWER($2)
                OR LOWER(op.name) LIKE LOWER($2)
            )`, [userId, `%${query}%`]
        );
        res.json(korisnici.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}   