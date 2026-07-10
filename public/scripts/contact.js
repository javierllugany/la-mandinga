// Funcionalidad de contacto
class ContactHandler {
    constructor() {
        this.setupContact();
    }

    setupContact() {
        // Abrir modal de contacto
        document.getElementById('contactBtn').addEventListener('click', () => {
            document.getElementById('contact-modal').style.display = 'block';
        });

        document.getElementById('mobileContactBtn').addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.remove('active');
            document.getElementById('contact-modal').style.display = 'block';
        });

        // Cerrar modal de contacto
        document.getElementById('closeContact').addEventListener('click', () => {
            document.getElementById('contact-modal').style.display = 'none';
        });

        // Enviar formulario
        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                message: document.getElementById('contactMessage').value
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (result.success) {
                    alert('¡Mensaje enviado con éxito! Te contactaremos pronto.');
                    document.getElementById('contactForm').reset();
                    document.getElementById('contact-modal').style.display = 'none';
                } else {
                    alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
                }
            } catch (error) {
                console.error('Error enviando mensaje:', error);
                alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
            }
        });
    }
}

// Inicializar contacto
const contactHandler = new ContactHandler();