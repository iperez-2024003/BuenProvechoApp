import { Resend } from 'resend';
import { config } from '../configs/config.js';

const resend = config.resend?.apiKey ? new Resend(config.resend.apiKey) : null;

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
