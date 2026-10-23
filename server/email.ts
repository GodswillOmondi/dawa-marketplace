import { Resend } from 'resend';
import { db } from './db/index.js';
import { emailLogs } from './db/schema.js';
import * as dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendEmailParams {
  orderId?: number;
  recipientEmail: string;
  subject: string;
  html: string;
}

export async function sendOrderStatusEmail({ orderId, recipientEmail, subject, html }: SendEmailParams) {
  let deliveryStatus: 'SENT_VIA_RESEND' | 'RECORDED_IN_APP' = 'RECORDED_IN_APP';

  if (resend && resendApiKey) {
    try {
      const response = await resend.emails.send({
        from: 'Dawa Equips <onboarding@resend.dev>',
        to: recipientEmail,
        subject,
        html,
      });
      if (response && !response.error) {
        deliveryStatus = 'SENT_VIA_RESEND';
      } else {
        console.warn('Resend returned error, recording email in-app:', response?.error);
      }
    } catch (err) {
      console.warn('Resend dispatch failed (likely sandbox or key restriction). Falling back to RECORDED_IN_APP:', err);
    }
  }

  // Always persist email log in database so it can be previewed in UI
  try {
    const [log] = await db.insert(emailLogs).values({
      orderId,
      recipientEmail,
      subject,
      body: html,
      deliveryStatus,
      sentAt: new Date(),
    }).returning();
    return log;
  } catch (dbErr) {
    console.error('Failed to save email log to database:', dbErr);
    return null;
  }
}
