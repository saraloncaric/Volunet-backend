import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next()
}
export const validatorRegistracija = [
    body('ime')
        .trim()
        .notEmpty().withMessage('Ime je obavezno')
        .isLength({ min: 2 }).withMessage('Ime mora imati minimalno 2 znaka')
        .escape(),
    body('prezime')
        .trim()
        .notEmpty().withMessage('Prezime je obavezno')
        .isLength({ min: 2 }).withMessage('Prezime mora imati minimalno 2 znaka')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email je obavezno')
        .isEmail().withMessage('Email adresa nije ispravna'),
    body('password')
        .notEmpty().withMessage('Lozinka je obavezna')
        .isLength({ min: 6 }).withMessage('Lozinka mora imati minimalno 6 znakova'),
    body('role')
        .notEmpty().withMessage('Obavezno polje')
        .isIn(['volonter', 'udruga']).withMessage('Rola mora biti volonter ili udruga'),
    handleValidationErrors
]
export const validatorLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email je obavezan')
        .isEmail().withMessage('Email adresa nije ispravna'),
    body('password')
        .notEmpty().withMessage('Lozinka je obavezna'),
    handleValidationErrors
]