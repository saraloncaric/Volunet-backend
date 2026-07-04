import { pool } from "../db/db.js";
import { posaljiMailPotvrde } from "../utils/email.js";

export const prijavaNaZadatak = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser;
        const volonter = await pool.query(`
            SELECT id
            FROM volunteer_profiles
            WHERE user_id = $1`, [userId]
        );
        if(volonter.rows.length === 0) {
            return res.status(404).json({ message: 'Volonter nije pronađen' });
        }    
        const volunteer_id = volonter.rows[0].id;    
        const zadatak = await pool.query(`
            SELECT *
            FROM tasks 
            WHERE id = $1 AND status = 'aktivan'`, [id]
        );
        if(zadatak.rows.length === 0) {
            return res.status(400).json({ message: 'Zadatak nije pronađen ili nije aktivan' });
        }
        const volonterPrijavljen = await pool.query(`
            SELECT id
            FROM task_applications
            WHERE volunteer_id = $1 AND task_id = $2`, [volunteer_id, id]
        );
        if(volonterPrijavljen.rows.length > 0) {
            return res.status(400).json({ message: 'Volonter je već prijavljen na ovaj zadatak' });
        }
        const task = zadatak.rows[0];
        if(task.max_volunteers !== null) {
            const brojPrijavljenih = await pool.query(`
                SELECT COUNT(*)
                FROM task_applications
                WHERE task_id = $1 AND status != 'odbijen'`, [id]
            );
            if(parseInt(brojPrijavljenih.rows[0].count) >= task.max_volunteers) {
                return res.status(400).json({ message: 'Zadatak je popunjen' });
            }
        }
        const prijava = await pool.query(`
            INSERT INTO task_applications (task_id, volunteer_id)
            VALUES ($1, $2)
            RETURNING *`, [id, volunteer_id]
        );
        const korisnik = await pool.query(`
            SELECT u.email, vp.name
            FROM users u
            JOIN volunteer_profiles vp ON u.id = vp.user_id
            WHERE u.id = $1`, [userId]
        );
        await posaljiMailPotvrde(
            korisnik.rows[0].email,
            korisnik.rows[0].name,
            task.title
        );
        res.status(201).json({ message: 'Uspješno ste se prijavili na zadatak', prijava: prijava.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const otkaziPrijavu = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser;
        const volonter = await pool.query(`
            SELECT id
            FROM volunteer_profiles
            WHERE user_id = $1`, [userId]
        );
        if(volonter.rows.length === 0) {
            return res.status(404).json({ message: 'Volonter nije pronađen' });
        }    
        const volunteer_id = volonter.rows[0].id;   
        const zadatak = await pool.query(`
            SELECT *
            FROM tasks 
            WHERE id = $1 AND status = 'aktivan'`, [id]
        );
        if(zadatak.rows.length === 0) {
            return res.status(400).json({ message: 'Zadatak nije pronađen ili nije aktivan' });
        }
        const volonterPrijavljen = await pool.query(`
            SELECT id, status
            FROM task_applications
            WHERE volunteer_id = $1 AND task_id = $2`, [volunteer_id, id]
        );
        if(volonterPrijavljen.rows.length === 0) {
            return res.status(400).json({ message: 'Volonter nije prijavljen na ovaj zadatak' });
        }
        if(volonterPrijavljen.rows[0].status === 'potvrden') {
            return res.status(404).json({ message: 'Prijava je već potvrđena, odjava od zadatka nije moguća'})
        }
        await pool.query(`
            DELETE FROM task_applications
            WHERE volunteer_id = $1 AND task_id = $2`, [volunteer_id, id]
        );
        res.status(201).json({ message: 'Uspješno ste se odjavili sa zadatka' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const upitOdVolontera = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser;
        const { status } = req.body;
        if(status !== 'potvrden' && status !== 'odbijen') {
            return res.status(400).json({ message: 'Status može biti samo potvrden ili odbijen' });
        }
        const provjeraPrijave = await pool.query(`
            SELECT ta.*, tasks.organization_id
            FROM task_applications ta
            JOIN tasks ON ta.task_id = tasks.id
            WHERE ta.id = $1`, [id]
        );
        if(provjeraPrijave.rows.length === 0) {
            return res.status(404).json({ message: 'Prijava nije pronađena' });
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
        if(provjeraPrijave.rows[0].organization_id !== organization_id) {
            return res.status(403).json({ message: 'Nemate pristup ovoj prijavi' });
        }
        const promjenaStatusa = await pool.query(`
            UPDATE task_applications
            SET status = $1
            WHERE id = $2
            RETURNING *`, [status, id]
        );
        res.status(200).json({ message: 'Prijava uspješno potvrđena', prijava: promjenaStatusa.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const zatvoriPrijave = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser;

        const prijava = await pool.query(`
            SELECT ta.*, t.organization_id, t.start_date, t.end_date
            FROM task_applications ta
            JOIN tasks t ON ta.task_id = t.id
            WHERE ta.id = $1`, [id]
        );
        if(prijava.rows.length === 0) {
            return res.status(404).json({ message: 'Prijava nije pronađena' });
        }
        if(prijava.rows[0].status !== 'potvrden') {
            return res.status(400).json({ message: 'Prijava mora biti potvrđena prije zatvaranja' });
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
        if(prijava.rows[0].organization_id !== organization_id) {
            return res.status(403).json({ message: 'Nemate pristup ovoj prijavi' });
        }
        await pool.query(`
            UPDATE task_applications
            SET status = 'zavrsen', completed_at = NOW()
            WHERE id = $1`, [id]
        );
        const startDate = new Date(prijava.rows[0].start_date);
        const endDate = prijava.rows[0].end_date ? new Date(prijava.rows[0].end_date) : startDate;
        const sati = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));
        await pool.query(`
            UPDATE volunteer_profiles
            SET total_hours = total_hours + $1
            WHERE id = $2`, [sati, prijava.rows[0].volunteer_id]
        );
        res.status(200).json({ message: 'Prijava uspješno zatvorena, sati volontiranja ažurirani' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const provjeriPrijavu = async(req, res) => {
    try {
        const { id } = req.params;
        const { id: userId } = req.authUser;
        const result = await pool.query(`
            SELECT id FROM task_applications
            WHERE task_id = $1 
            AND volunteer_id = (SELECT id FROM volunteer_profiles WHERE user_id = $2)`, [id, userId]
        );
        res.json({ prijavljen: result.rows.length > 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}