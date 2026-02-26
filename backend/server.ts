import 'dotenv/config';
import app from './src/app';
import { connectDB } from './src/config/db';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const start = async (): Promise<void> => {
  // Start server immediately, connect to MongoDB in background
  app.listen(PORT, () => {
    // Connect to MongoDB after server is running
    setImmediate(() => void connectDB());
    console.log(`\n?? EcoSync AI Backend running on http://localhost:${PORT}`);
    console.log(`?? Health:         GET  /api/health`);
    console.log(`?? Classify:       POST /api/classify`);
    console.log(`?? Register:       POST /api/auth/register`);
    console.log(`? Verify OTP:     POST /api/auth/verify-otp`);
    console.log(`?? Resend OTP:     POST /api/auth/resend-otp`);
    console.log(`?? Login:          POST /api/auth/login`);
    console.log(`?? Profile:        GET  /api/auth/profile  [protected]`);
    console.log(`?? Notifications:  GET  /api/user/:id/notifications`);
    console.log(`??                 PUT  /api/user/:id/notifications`);
    console.log(`?? Password:       PUT  /api/user/:id/password`);
    console.log(`???  Delete Acct:   DELETE /api/user/:id/account`);
    console.log(`? FAQs:           GET  /api/support/faqs`);
    console.log(`?? Contact:        POST /api/support/contact`);

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('\n??  Set your Gemini API key in backend/.env');
      console.log('   Get a FREE key at: https://aistudio.google.com/app/apikey\n');
    } else {
      console.log('? Gemini API key configured\n');
    }
  });
};

start().catch(console.error);
