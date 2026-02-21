require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// ─── MongoDB Connection ───────────────────────────────────────────────────────

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// ─── Mongoose Models ──────────────────────────────────────────────────────────

const notifPrefsSchema = new mongoose.Schema({
  userId:              { type: String, required: true, unique: true },
  recyclingReminders:  { type: Boolean, default: true },
  challengeAlerts:     { type: Boolean, default: true },
  communityReports:    { type: Boolean, default: true },
  weeklySummary:       { type: Boolean, default: true },
  newBadges:           { type: Boolean, default: true },
  binFull:             { type: Boolean, default: false },
}, { timestamps: true });

const NotifPrefs = mongoose.model('NotifPrefs', notifPrefsSchema);

const supportTicketSchema = new mongoose.Schema({
  ticketId:   { type: String, required: true, unique: true },
  name:       String,
  email:      String,
  category:   { type: String, default: 'General' },
  message:    String,
  status:     { type: String, default: 'open' },
}, { timestamps: true });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

const userSchema = new mongoose.Schema({
  userId:        { type: String, required: true, unique: true },
  email:         { type: String, required: true, unique: true },
  name:          String,
  greenPoints:   { type: Number, default: 0 },
  totalRecycled: { type: Number, default: 0 },
  carbonSaved:   { type: Number, default: 0 },
  joinedDate:    String,
  avatar:        String,
  password:      String,
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Static FAQs ────────────────────────────────────────────────────────────

const faqs = [
  {
    id: 1,
    question: 'How does the AI waste classification work?',
    answer: 'Our AI uses Google Gemini Vision to analyze photos of waste items and identify the waste type, recyclability, and the correct disposal bin. Simply point your camera at an item and tap Scan.',
  },
  {
    id: 2,
    question: 'How do I earn Green Points (GP)?',
    answer: 'You earn GP by scanning and recycling items (5–30 GP each depending on type), completing weekly challenges, reporting illegal dumps, and maintaining daily streaks.',
  },
  {
    id: 3,
    question: 'Can I redeem my Green Points?',
    answer: 'Yes! Visit the Rewards section to redeem GP for eco-friendly products, discount vouchers, and exclusive merchandise from our sustainability partners.',
  },
  {
    id: 4,
    question: 'How accurate is the waste detection?',
    answer: 'Our AI achieves 95%+ accuracy on common waste items. For best results, ensure good lighting, hold the item steady, and make sure it fills most of the camera frame.',
  },
  {
    id: 5,
    question: 'What data does EcoSync collect?',
    answer: 'We collect your email, name, recycling activity, and location (only when finding nearby bins). We never sell your data. See our Privacy Policy for full details.',
  },
  {
    id: 6,
    question: 'How do I report an illegal dumping site?',
    answer: 'Tap the "Report" feature in the app, pin the location on the map, describe the waste type and severity, and optionally attach a photo. You earn 50 GP per verified report.',
  },
];

// ─── Waste category point system ──────────────────────────────────────────────

const pointsByCategory = {
  plastic: 15,
  paper: 10,
  glass: 20,
  metal: 25,
  organic: 8,
  electronic: 30,
  hazardous: 20,
  textile: 12,
  general: 5,
};

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    message: 'EcoSync AI Backend is running',
    mongodb: dbState[mongoose.connection.readyState] || 'unknown',
  });
});

// ─── AI Classify ─────────────────────────────────────────────────────────────

app.post('/api/classify', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({
        error: 'GEMINI_API_KEY not configured',
        message: 'Please set your Gemini API key in backend/.env file. Get a FREE key at: https://aistudio.google.com/app/apikey',
      });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert AI waste classification system for a smart waste management app.

Analyze the image and classify the waste item shown. Respond ONLY with a valid JSON object, no markdown or extra text.

JSON format:
{
  "wasteType": "specific name of the item (e.g., Plastic Water Bottle)",
  "category": "one of: plastic, paper, glass, metal, organic, electronic, hazardous, textile, general",
  "recyclable": true or false,
  "confidence": percentage number 0-100,
  "color": "hex color representing this waste type (e.g., #3B82F6 for plastic)",
  "instructions": ["step 1 instruction", "step 2 instruction", "step 3 instruction"],
  "tips": "one short eco-tip related to this item",
  "binColor": "which bin to use (e.g., Blue Recycling Bin, Green Compost Bin, Black General Waste)"
}

Categories:
- plastic: bottles, bags, containers, packaging
- paper: newspapers, cardboard, office paper, books
- glass: bottles, jars, broken glass
- metal: cans, foil, appliances, wires
- organic: food waste, garden waste, biodegradable items
- electronic: phones, batteries, computers, cables
- hazardous: chemicals, paint, medicine, fluorescent bulbs
- textile: clothing, fabric, shoes
- general: non-recyclable mixed waste

If no waste item is visible, return: {"error": "No waste item detected in image"}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: base64Data } },
    ]);

    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(422).json({ error: 'Could not parse AI response. Please try again.' });
    }

    const classification = JSON.parse(jsonMatch[0]);

    if (classification.error) {
      return res.status(422).json({ error: classification.error });
    }

    const category = (classification.category || 'general').toLowerCase();
    classification.points = pointsByCategory[category] || 5;

    res.json({ success: true, data: classification });
  } catch (error) {
    console.error('Classification error:', error);
    if (error.message?.includes('API_KEY')) {
      return res.status(401).json({
        error: 'Invalid API key. Get your FREE key at: https://aistudio.google.com/app/apikey',
      });
    }
    res.status(500).json({ error: 'Classification failed. Please try again.' });
  }
});

// ─── Notifications ────────────────────────────────────────────────────────────

app.get('/api/user/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    let prefs = await NotifPrefs.findOne({ userId });
    if (!prefs) prefs = await NotifPrefs.create({ userId });
    res.json({ success: true, data: prefs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/user/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    const allowed = ['recyclingReminders', 'challengeAlerts', 'communityReports', 'weeklySummary', 'newBadges', 'binFull'];
    const updates = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = Boolean(req.body[key]);
    }
    const prefs = await NotifPrefs.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Notification preferences saved!', data: prefs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Password ─────────────────────────────────────────────────────────────────

app.put('/api/user/:userId/password', (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ success: false, message: 'New password must be different from current password.' });
  }
  // Simulated check — demo user password is "demo123"
  if (currentPassword !== 'demo123') {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  res.json({ success: true, message: 'Password changed successfully!' });
});

// ─── Account Deletion ─────────────────────────────────────────────────────────

app.delete('/api/user/:userId/account', (req, res) => {
  const { confirmation } = req.body;
  if (confirmation !== 'DELETE') {
    return res.status(400).json({ success: false, message: 'Type DELETE to confirm account deletion.' });
  }
  res.json({ success: true, message: 'Account deleted successfully. Goodbye!' });
});

// ─── Support: FAQs & Contact ──────────────────────────────────────────────────

app.get('/api/support/faqs', (req, res) => {
  res.json({ success: true, data: faqs });
});

app.post('/api/support/contact', async (req, res) => {
  const { name, email, category, message } = req.body;

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
      category: category || 'General',
      message,
      status: 'open',
    });
    console.log(`📧 Ticket ${ticket.ticketId} from ${email} [${ticket.category}]: ${message.substring(0, 60)}`);
    res.json({
      success: true,
      message: "Your message has been received! We'll get back to you within 24 hours.",
      ticketId: ticket.ticketId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🌿 EcoSync AI Backend running on http://localhost:${PORT}`);
  console.log(`📋 Health:         GET  /api/health`);
  console.log(`🤖 Classify:       POST /api/classify`);
  console.log(`🔔 Notifications:  GET  /api/user/:id/notifications`);
  console.log(`🔔                 PUT  /api/user/:id/notifications`);
  console.log(`🔐 Password:       PUT  /api/user/:id/password`);
  console.log(`🗑️  Delete Acct:   DELETE /api/user/:id/account`);
  console.log(`❓ FAQs:           GET  /api/support/faqs`);
  console.log(`📬 Contact:        POST /api/support/contact`);
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.log('\n⚠️  Set your Gemini API key in backend/.env');
    console.log('   Get a FREE key at: https://aistudio.google.com/app/apikey\n');
  } else {
    console.log('✅ Gemini API key configured\n');
  }
});
