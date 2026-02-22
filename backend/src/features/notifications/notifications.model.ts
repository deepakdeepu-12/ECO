import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotifPrefs extends Document {
  userId: string;
  recyclingReminders: boolean;
  challengeAlerts: boolean;
  communityReports: boolean;
  weeklySummary: boolean;
  newBadges: boolean;
  binFull: boolean;
}

const notifPrefsSchema = new Schema<INotifPrefs>(
  {
    userId:             { type: String, required: true, unique: true },
    recyclingReminders: { type: Boolean, default: true },
    challengeAlerts:    { type: Boolean, default: true },
    communityReports:   { type: Boolean, default: true },
    weeklySummary:      { type: Boolean, default: true },
    newBadges:          { type: Boolean, default: true },
    binFull:            { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NotifPrefs: Model<INotifPrefs> =
  mongoose.model<INotifPrefs>('NotifPrefs', notifPrefsSchema);

export default NotifPrefs;
