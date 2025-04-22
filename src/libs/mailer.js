import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail', // O usá otro servicio SMTP
  auth: {
    user: 'rodrigo.moens@gmail.com',
    pass: 'kmnh sgwz werd papk'
  }
});

async function enviarMailRecuperacion(destinatario, codigo) {
  
  //const enlace = `https://localhost:3000/api/recovery-password?token=${token}`;

  const mailOptions = {
    from: 'rodrigo.moens@gmail.com',
    to: destinatario,
    subject: 'Recuperación de contraseña',
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Ingrese el codigo "${codigo}" en la aplicacion.</p>
      <p>Este enlace expirará en 1 hora.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado con éxito');
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
}

export default enviarMailRecuperacion