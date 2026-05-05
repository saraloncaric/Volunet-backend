export const isVolonter = async(req, res, next) => {
    if(req.authUser.role !== 'volonter') {
        return res.status(403).json({ message: 'Pristup dozvoljen samo volonterima' });
    }
    next()
}
export const isUdruga = async(req, res, next) => {
    if(req.authUser.role !== 'udruga') {
        return res.status(403).json({ message: 'Pristup dozvoljen samo udrugama' });
    }
    next()
}
export const isAdmin = async(req, res, next) => {
    if(req.authUser.role !== 'admin') {
        return res.status(403).json({ message: 'Pristup dozvoljen samo adminu' });
    }
    next()
}
export const isUdrugaIliAdmin = (req, res, next) => {
    if(req.authUser.role !== 'udruga' && req.authUser.role !== 'admin') {
        return res.status(403).json({ message: 'Pristup dozvoljen samo udrugama i adminu' });
    }
    next();
}