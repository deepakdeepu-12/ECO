/**
 * Quick email test script to verify Gmail App Password and SMTP connection
 * Run with: node test-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('\n🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '❌ NOT SET'}`);
  console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ SET (' + process.env.EMAIL_PASSWORD.length + ' chars)' : '❌ NOT SET'}`);
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || '⚠️  NOT SET (optional)'}\n`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Missing EMAIL_USER or EMAIL_PASSWORD in .env file\n');
    console.log('📖 How to set up Gmail App Password:');
    console.log('   1. Go to: https://myaccount.google.com/apppasswords');
    console.log('   2. Create a new App Password for "Mail"');
    console.log('   3. Copy the 16-character password');
    console.log('   4. Add to backend/.env:\n');
    console.log('      EMAIL_USER=your_gmail@gmail.com');
    console.log('      EMAIL_PASSWORD=your_16_char_app_password\n');
    process.exit(1);
  }
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  // Test connection
  console.log('🔌 Testing SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('\n💡 Common fixes:');
    console.log('   • Ensure 2FA is enabled on your Google account');
    console.log('   • Generate a NEW App Password (old ones may expire)');
    console.log('   • Check that EMAIL_PASSWORD has no spaces or quotes');
    console.log('   • Try a different Gmail account\n');
    process.exit(1);
  }
  
  // Send test email
  const testOTP = String(Math.floor(100000 + Math.random() * 900000));
  console.log(`📧 Sending test OTP email (code: ${testOTP})...`);
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `EcoSync <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'EcoSync – Test OTP Email',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#0F170E;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:40px 20px;">
                <table width="500" cellpadding="0" cellspacing="0"
                       style="background:#1A2E1A;border-radius:16px;overflow:hidden;max-width:500px;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#22C55E,#059669);padding:32px;text-align:center;">
                      <div style="width:60px;height:60px;background:rgba(255,255,255,0.2);
                                  border-radius:16px;display:inline-flex;align-items:center;
                                  justify-content:center;font-size:28px;margin-bottom:12px;">🌿</div>
                      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">EcoSync</h1>
                      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Email Test Successful</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <h2 style="color:#86EFAC;margin:0 0 8px;font-size:20px;">Test Email 🧪</h2>
                      <p style="color:#D1D5DB;font-size:15px;line-height:1.6;margin:0 0 24px;">
                        Congratulations! Your email configuration is working correctly.
                        Here's your test verification code:
                      </p>
                      <div style="background:#0F170E;border:2px solid #22C55E;border-radius:12px;
                                  padding:24px;text-align:center;margin:0 0 24px;">
                        <p style="color:#86EFAC;font-size:13px;margin:0 0 8px;
                                  text-transform:uppercase;letter-spacing:2px;">Test Code</p>
                        <div style="color:#22C55E;font-size:42px;font-weight:700;
                                    letter-spacing:12px;font-family:monospace;">${testOTP}</div>
                      </div>
                      <p style="color:#9CA3AF;font-size:13px;margin:0;">
                        ✅ OTP emails will now be sent to users when they sign up!
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#0F170E;padding:20px;text-align:center;border-top:1px solid #1F2937;">
                      <p style="color:#4B5563;font-size:12px;margin:0;">
                        © 2026 EcoSync. Making the planet greener, one scan at a time.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`\n📬 Check your inbox: ${process.env.EMAIL_USER}`);
    console.log(`   Test OTP code: ${testOTP}\n`);
    console.log('🎉 Email system is ready! Users will receive OTP codes when they sign up.\n');
    
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please:');
      console.log('   1. Check that EMAIL_PASSWORD is correct');
      console.log('   2. Generate a fresh App Password');
      console.log('   3. Ensure 2FA is enabled on your Google account\n');
    }
    process.exit(1);
  }
}

testEmail().catch(console.error);
