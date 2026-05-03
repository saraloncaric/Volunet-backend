import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function hashPassword(password, saltRounds) {
    try {
        let hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (err) {
        console.error(`Došlo je do greške prilikom hashiranja lozinke: ${err}` );
        return null;
    }
}
export async function checkPassword(password, hashedPassword) {
    try {
        let result = await bcrypt.compare(password, hashedPassword); 
        return result;
    } catch (err) {
        console.error(`Došlo je do greške prilikom usporedbe hash vrijednosti: ${err}`);
        return false;
    }
}
export async function generateJWT(payload) {
    try {
        let token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }); 
        return token;
    } catch (err) {
        console.error(`Došlo je do greške prilikom generiranja JWT tokena: ${err}`);
        return null;
    }
}
export async function verifyJWT(token) {
    try {
        let decoded = jwt.verify(token, JWT_SECRET); 
        return decoded;
    } catch (err) {
        console.error(`Došlo je do greške prilikom verifikacije JWT tokena: ${err}`);
        return null;
    }
}