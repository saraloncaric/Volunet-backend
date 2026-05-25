import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const posaljiMailPotvrde = async(email, ime, naslovZadatka) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, 
        subject: 'Potvrda prijave na zadatak',
        html: `
            <h2>Pozdrav ${ime}!</h2>
            <p>Uspješno ste se prijavili na zadatak: <strong>${naslovZadatka}</strong></p>
            <p>Udruga će potvrditi vašu prijavu u najkraćem mogućem roku.</p>
            <br>
            <p>Srdačan pozdrav,</p>
            <p>Tim Volunet</p>
        `
    }
    await transporter.sendMail(mailOptions);
}
export const posaljiMailZaHitniZadatak = async(email, ime, naslovZadatka) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, 
        subject: 'Hitan zadatak!',
        html: `
            <h2>Pozdrav ${ime}!</h2>
            <p>Upravo je objavljen <strong>hitan zadatak</strong> koji treba vašu pomoć:</p>
            <h3>${naslovZadatka}</h3>
            <p>Svaka pomoć je dragocjena — prijavite se i napravite razliku danas!</p>
            <br>
            <p>Hvala što ste dio Volunet zajednice!</p>
            <p>Tim Volunet</p>
        `
    }
    await transporter.sendMail(mailOptions);
}