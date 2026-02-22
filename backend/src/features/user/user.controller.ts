import { Request, Response } from 'express';

// ─── PUT /api/user/:userId/password ──────────────────────────────────────────

export const changePassword = (req: Request, res: Response): Response => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ success: false, message: 'New password must be different from current password.' });
  }
  // Demo-mode check — replace with bcrypt compare against DB in production
  if (currentPassword !== 'demo123') {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  return res.json({ success: true, message: 'Password changed successfully!' });
};

// ─── DELETE /api/user/:userId/account ────────────────────────────────────────

export const deleteAccount = (req: Request, res: Response): Response => {
  const { confirmation } = req.body as { confirmation: string };

  if (confirmation !== 'DELETE') {
    return res.status(400).json({ success: false, message: 'Type DELETE to confirm account deletion.' });
  }

  return res.json({ success: true, message: 'Account deleted successfully. Goodbye!' });
};
