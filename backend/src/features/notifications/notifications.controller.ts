import { Request, Response } from 'express';
import NotifPrefs, { INotifPrefs } from './notifications.model';
import type { Document } from 'mongoose';

type PrefsKey = keyof Omit<INotifPrefs, keyof Document | 'userId'>;

const ALLOWED_KEYS: PrefsKey[] = [
  'recyclingReminders',
  'challengeAlerts',
  'communityReports',
  'weeklySummary',
  'newBadges',
  'binFull',
];

// ─── GET /api/user/:userId/notifications ──────────────────────────────────────

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    let prefs = await NotifPrefs.findOne({ userId });
    if (!prefs) prefs = await NotifPrefs.create({ userId: String(userId) });
    res.json({ success: true, data: prefs });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

// ─── PUT /api/user/:userId/notifications ──────────────────────────────────────

export const updateNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const updates: Record<string, boolean> = {};

    for (const key of ALLOWED_KEYS) {
      if (key in req.body) updates[key] = Boolean(req.body[key]);
    }

    const prefs = await NotifPrefs.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Notification preferences saved!', data: prefs });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
