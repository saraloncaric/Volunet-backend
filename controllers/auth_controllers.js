import { pool } from "../db/db.js";
import { hashPassword, checkPassword, generateJWT, verifyJWT } from "../utils/auth.js";

export const registracija = async(req, res) => {
    try {
        const { ime, prezime, naziv, email, password, role } = req.body;
        if(role === 'volonter') {
            if(!ime || !prezime || !email || !password || !role) {
                return res.status(400).json({ message: 'Svi podaci u obvezni' })
            }
        } else if(role === 'udruga') {
            if(!naziv || !email || !password || !role) {
                return res.status(400).json({ message: 'Svi podaci u obvezni' })
            }
        } else {
            return res.status(400).json({ message: 'Neispravna uloga(role)'})
        }

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if(userExists.rows.length > 0) {
            return res.status(400).json({ message: `Korisnik s emailom ${email} već postoji` });
        }
        const hashiranaPassword = await hashPassword(password, 10);
        if(!hashiranaPassword) {
            return res.status(400).json({ message: 'Greška pri hashiranju' })
        }
        await pool.query('BEGIN');
        const noviUser = await pool.query(`
            INSERT INTO users (email, password, role)
            VALUES ($1, $2, $3)
            RETURNING id, email, role, created_at`,
            [email , hashiranaPassword, role]
        );
        const user = noviUser.rows[0];
        if (role === 'volonter') {
            await pool.query(
                `INSERT INTO volunteer_profiles (user_id, first_name, last_name)
                 VALUES ($1, $2, $3)`,
                [user.id, ime, prezime]
            );
        } else if (role === 'udruga') {
            await pool.query(
                `INSERT INTO organization_profiles (user_id, name)
                 VALUES ($1, $2)`,
                [user.id, naziv]
            );
        }
        await pool.query('COMMIT');
        const token = await generateJWT({
            id: user.id,
            email: user.email,
            role: user.role
        });
        res.status(201).json({ message: 'Korisnik uspješno kreiran', user, token });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
}
export const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: 'Svi podaci su obavezni' });
        }

        const userFind = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        if(userFind.rows.length == 0) {
            return res.status(400).json({ message: 'Greška prilikom prijave'});
        }

        const user = userFind.rows[0];
        const passwordCheck = await checkPassword(password, user.password);
        if(!passwordCheck) {
            return res.status(400).json({ message: 'Greška prilikom prijave' });
        }
        const token = await generateJWT({
            id: user.id,
            email: user.email,
            role: user.role
        })
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({ message: 'Uspješna prijava', user: userWithoutPassword, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const prijavljenUser = async(req, res) => {
    try {
        const { id } = req.authUser;
        const exists = await pool.query(`
            SELECT id, email, role, created_at
            FROM users
            WHERE id = $1`, [id]
        );
        if(exists.rows.length == 0) {
            return res.status(404).json({ message: 'Korisnik nije pronađen' });
        }
        res.status(200).json(exists.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}