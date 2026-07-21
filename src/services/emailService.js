// src/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración para Yahoo
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // false para puerto 587 (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Envía un correo electrónico.
 * @param {string} to - Destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} html - Contenido del correo en formato HTML.
 * @param {string} bcc - Remitente.
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, html) => {
    try {
        if (!transporter) {
            throw new Error('transporter no configurado');
        }

        const mailOptions = {
            from: `"La Mandinga" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            html: html,
            bcc: process.env.SMTP_USER
        };

        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        //console.log(`✅ Correo enviado a ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Error enviando correo a ${to}:`, error);
        throw error; // Lanza el error para que la función que lo llamó pueda manejarlo
    }
};

module.exports = sendEmail;