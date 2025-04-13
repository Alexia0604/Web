const nodemailer = require('nodemailer');
require('dotenv').config();

// Creez un transportor pentru nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Puteți folosi și alți furnizori precum 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Trebuie adăugat în fișierul .env
    pass: process.env.EMAIL_PASS  // Trebuie adăugat în fișierul .env
  }
});

// Funcție pentru a trimite email-uri
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email trimis: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Eroare la trimiterea email-ului:', error);
    return { success: false, error };
  }
};

// Template pentru email-ul de resetare a parolei
const createResetPasswordEmailContent = (username, resetCode) => {
  return {
    text: `Salut ${username},\n\nAi cerut resetarea parolei pentru contul tău BirdHub.\n\nCodul tău de resetare este: ${resetCode}\n\nAcest cod este valabil timp de o oră.\n\nDacă nu ai solicitat această resetare, te rugăm să ignori acest email.\n\nCu stimă,\nEchipa BirdHub`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #3B82F6;">Resetare parolă BirdHub</h2>
        <p>Salut <strong>${username}</strong>,</p>
        <p>Ai cerut resetarea parolei pentru contul tău BirdHub.</p>
        <p>Codul tău de resetare este:</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${resetCode}</span>
        </div>
        <p>Acest cod este valabil timp de o oră.</p>
        <p>Dacă nu ai solicitat această resetare, te rugăm să ignori acest email.</p>
        <p>Cu stimă,<br>Echipa BirdHub</p>
      </div>
    `
  };
};

module.exports = {
  sendEmail,
  createResetPasswordEmailContent
}; 