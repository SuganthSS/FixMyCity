import express, { Request, Response } from 'express';
import { sendEmail, sendWelcomeEmail } from '../services/emailService.ts';

const router = express.Router();

/**
 * @desc    Test email dispatch endpoint
 * @route   POST /api/test/send-email
 * @access  Development / Admin
 */
router.post('/send-email', async (req: Request, res: Response) => {
  const { to, subject, html, name, template } = req.body;

  if (!to) {
    res.status(400).json({ success: false, message: 'Recipient email "to" is required.' });
    return;
  }

  let result;

  if (template === 'welcome') {
    result = await sendWelcomeEmail(to, name || 'User');
  } else {
    result = await sendEmail({
      to,
      subject: subject || 'FixMyCity Test Email',
      html: html || '<p>This is a test email sent from <strong>FixMyCity Email Service</strong>.</p>',
    });
  }

  if (result.success) {
    res.json({
      success: true,
      message: 'Email request processed successfully',
      details: result,
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Email dispatch failed',
      error: result.error,
    });
  }
});

export default router;
