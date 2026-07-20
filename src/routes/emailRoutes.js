// backend/src/routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const sendEmail = require('../services/emailService');

router.post('/email/send-order-email', async (req, res) => {
    try {
        const { to, subject, html} = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }
        await sendEmail(to, subject, html);
        res.json({
            success: true,
            message: 'Correo enviado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al enviar el correo',
            error: error.message
        });
    }
});

module.exports = router;