import { Request, Response } from 'express';
import SupportTicket from './support.model';
import { faqs } from './support.service';

// ─── GET /api/support/faqs ────────────────────────────────────────────────────

export const getFAQs = (_req: Request, res: Response): void => {
  res.json({ success: true, data: faqs });
};

// ─── POST /api/support/contact ────────────────────────────────────────────────

export const submitContact = async (req: Request, res: Response): Promise<Response> => {
  const { name, email, category, message } = req.body as {
    name: string; email: string; category?: string; message: string;
  };

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  try {
    const ticket = await SupportTicket.create({
      ticketId: `TICKET-${Date.now()}`,
      name,
      email,
      category: category ?? 'General',
      message,
      status: 'open',
    });

    console.log(
      `📧 Ticket ${ticket.ticketId} from ${email} [${ticket.category}]: ${message.substring(0, 60)}`
    );

    return res.json({
      success: true,
      message: "Your message has been received! We'll get back to you within 24 hours.",
      ticketId: ticket.ticketId,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: (err as Error).message });
  }
};
