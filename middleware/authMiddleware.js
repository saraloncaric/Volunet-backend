import { verifyJWT } from "../utils/auth.js";

export const authMiddleware = async(req, res, next) => {
    try {
        const header = req.headers.authorization;
        if(!header) {
            return res.status(400).json({ message: 'Nedostaje token' });
        }
        const splitToken = header.split(' ');
        if(splitToken.length !== 2 || splitToken[0] !== 'Bearer') {
            return res.status(400).json({ message: 'Neispravan format tokena' });
        }
        const token = splitToken[1];
        const dekodirano = await verifyJWT(token);
        if(!dekodirano) {
            return res.status(400).json({ message: 'Token nije ispravan' });
        }
        req.authUser = dekodirano;
        next()
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}