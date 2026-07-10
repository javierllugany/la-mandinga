// En backend/src/controllers/contactController.js
const contactController = {
    async sendMessage(req, res) {
        try {
            const { name, email, message } = req.body;
            
            // Aquí puedes integrar con un servicio de email (nodemailer, SendGrid, etc.)
            console.log('Mensaje recibido:', { name, email, message });
            
            // Simular envío exitoso
            res.json({
                success: true,
                message: 'Mensaje enviado correctamente'
            });
            
            // En producción, enviar email:
            // await sendEmail({ name, email, message });
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar el mensaje'
            });
        }
    }
};