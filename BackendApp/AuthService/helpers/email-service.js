import { config } from '../configs/config.js';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

export const verifyEmailService = async () => {
  if (!config.email.apiKey) {
    console.warn('⛔ Brevo no configurado — agrega BREVO_API_KEY en .env');
    return false;
  }
  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.email.apiKey,
      },
      body: JSON.stringify({
        sender: { name: config.email.fromName, email: config.email.fromEmail },
        to: [{ email: 'gestionrestaurante3@gmail.com' }],
        subject: 'Buen Provecho — Servicio de correo activo',
        htmlContent: '<p>El servicio de correo electrónico está funcionando correctamente.</p>',
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al enviar correo de prueba');
    }
    console.log('✅ Brevo conectado y listo para enviar correos.');
    return true;
  } catch (err) {
    console.error('⛔ Brevo no pudo enviar correo de prueba:', err.message);
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

const sendViaBrevo = async (to, subject, html) => {
  if (!config.email.apiKey) throw new Error('Brevo not configured');

  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.email.apiKey,
    },
    body: JSON.stringify({
      sender: { name: config.email.fromName, email: config.email.fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al enviar email vía Brevo');
  }
};

export const sendVerificationEmail = async (email, name, verificationToken) => {
  const frontendUrl = config.app.frontendUrl || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

  await sendViaBrevo(
    email,
    'Verifica tu cuenta en Buen Provecho',
    buildHtmlWrapper(`¡Hola ${name}!`, `
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Gracias por registrarte. Por favor verifica tu cuenta haciendo clic en el siguiente botón:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href='${verificationUrl}' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Verificar mi cuenta</a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p style="color: #4f46e5; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Este enlace expira en 24 horas.</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">Si no solicitaste esta cuenta, ignora este correo.</p>
    `),
  );
};

export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const frontendUrl = config.app.frontendUrl || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  await sendViaBrevo(
    email,
    'Recuperación de contraseña — Buen Provecho',
    buildHtmlWrapper(`Hola ${name},`, `
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href='${resetUrl}' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Restablecer Contraseña</a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">O copia este enlace en tu navegador:</p>
      <p style="color: #4f46e5; font-size: 14px; word-break: break-all;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Este enlace expira en 1 hora.</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">Si no solicitaste este cambio, ignora este correo y tu cuenta seguirá segura.</p>
    `),
  );
};

export const sendWelcomeEmail = async (email, name) => {
  await sendViaBrevo(
    email,
    '¡Bienvenido a Buen Provecho!',
    buildHtmlWrapper(`¡Hola ${name}!`, `
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Tu cuenta ha sido verificada y activada exitosamente.</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Ya puedes acceder a nuestra plataforma y comenzar a disfrutar de nuestros servicios.</p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Si tienes alguna pregunta, no dudes en contactar a soporte.</p>
      <p style="color: #111827; font-weight: bold; margin-top: 20px;">¡Gracias por unirte!</p>
    `),
  );
};

export const sendPasswordChangedEmail = async (email, name) => {
  await sendViaBrevo(
    email,
    'Tu contraseña ha sido actualizada — Buen Provecho',
    buildHtmlWrapper('Contraseña Actualizada', `
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hola ${name},</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Te informamos que tu contraseña ha sido cambiada exitosamente.</p>
      <p style="color: #ef4444; font-size: 14px; margin-top: 30px;">Si tú no realizaste este cambio, por favor contacta a soporte inmediatamente.</p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
    `),
  );
};

export const sendHtmlEmail = async (email, subject, html) => {
  await sendViaBrevo(email, subject, html);
};
