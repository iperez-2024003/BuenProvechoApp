import { config } from '../configs/config.js';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

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

export const sendHtmlEmail = async (email, subject, html) => {
  await sendViaBrevo(email, subject, html);
};
