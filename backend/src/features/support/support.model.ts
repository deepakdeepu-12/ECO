import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
  ticketId: string;
  name?: string;
  email?: string;
  category: string;
  message?: string;
  status: string;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    name:     String,
    email:    String,
    category: { type: String, default: 'General' },
    message:  String,
    status:   { type: String, default: 'open' },
  },
  { timestamps: true }
);

const SupportTicket: Model<ISupportTicket> =
  mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);

export default SupportTicket;
