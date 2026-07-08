import { Resend } from 'resend';
import { config } from '../configs/config.js';

const resend = config.resend?.apiKey ? new Resend(config.resend.apiKey) : null;

export const verifyEmailService = async () => {
  if (!resend) {
    console.warn('⛔ Resend no configurado — los correos no se enviarán. Agrega RESEND_API_KEY en .env');
    return false;
  }
  try {
    // Sandbox mode: solo puede enviar al email verificado (gestionrestaurante3@gmail.com)
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: 'gestionrestaurante3@gmail.com',
      subject: 'Buen Provecho — Servicio de correo activo',
      html: '<p>El servicio de correo electrónico está funcionando correctamente.</p>',
    });
    console.log('✅ Resend conectado y listo para enviar correos.');
    return true;
  } catch (err) {
    console.error('⛔ Resend no pudo enviar correo de prueba:', err.message);
    return false;
  }
};

const buildHtmlWrapper = (title, content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #1c1712; padding: 20px; text-align: center; border-bottom: 4px solid #b98c52;">
      <h1 style="color: #b98c52; margin: 0; font-family: Georgia, serif;">Buen Provecho</h1>
    </div>
    <div style="padding: 30px; background-color: #ffffff;">
      ${content}
    </div>
  </div>
`;

export const sendVerificationEmail = async (email, name, verificationToken) => {
  if (!resend) throw new Error('Resend not configured');

  const frontendUrl = config.app.frontendUrl || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: email,
      subject: 'Verifica tu cuenta en Buen Provecho',
      html: buildHtmlWrapper(`¡Hola ${name}!`, `
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Gracias por registrarte. Por favor verifica tu cuenta haciendo clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href='${verificationUrl}' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>
            Verificar mi cuenta
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p style="color: #4f46e5; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">Este enlace expira en 24 horas.</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">Si no solicitaste esta cuenta, ignora este correo.</p>
      `),
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, name, resetToken) => {
  if (!resend) throw new Error('Resend not configured');

  const frontendUrl = config.app.frontendUrl || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: email,
      subject: 'Recuperación de contraseña — Buen Provecho',
      html: buildHtmlWrapper(`Hola ${name},`, `
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href='${resetUrl}' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>
            Restablecer Contraseña
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">O copia este enlace en tu navegador:</p>
        <p style="color: #4f46e5; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">Este enlace expira en 1 hora.</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">Si no solicitaste este cambio, ignora este correo y tu cuenta seguirá segura.</p>
      `),
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  if (!resend) throw new Error('Resend not configured');

  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: email,
      subject: '¡Bienvenido a Buen Provecho!',
      html: buildHtmlWrapper(`¡Hola ${name}!`, `
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Tu cuenta ha sido verificada y activada exitosamente.</p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Ya puedes acceder a nuestra plataforma y comenzar a disfrutar de nuestros servicios.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Si tienes alguna pregunta, no dudes en contactar a soporte.</p>
        <p style="color: #111827; font-weight: bold; margin-top: 20px;">¡Gracias por unirte!</p>
      `),
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendPasswordChangedEmail = async (email, name) => {
  if (!resend) throw new Error('Resend not configured');

  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: email,
      subject: 'Tu contraseña ha sido actualizada — Buen Provecho',
      html: buildHtmlWrapper('Contraseña Actualizada', `
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hola ${name},</p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Te informamos que tu contraseña ha sido cambiada exitosamente.</p>
        <p style="color: #ef4444; font-size: 14px; margin-top: 30px;">Si tú no realizaste este cambio, por favor contacta a soporte inmediatamente.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
      `),
    });
  } catch (error) {
    console.error('Error sending password changed email:', error);
    throw error;
  }
};

export const sendHtmlEmail = async (email, subject, html) => {
  if (!resend) throw new Error('Resend not configured');

  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending HTML email:', error);
    throw error;
  }
};
