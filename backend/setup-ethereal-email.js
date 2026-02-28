/**
 * Generate Ethereal Email test credentials (catches emails without sending)
 * Run with: node setup-ethereal-email.js
 */

const nodemailer = require('nodemailer');

async function setupEthereal() {
  console.log('\n🧪 Generating Ethereal Email Test Account...\n');
  
  try {
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('✅ Test email account created!\n');
    console.log('📋 Add these to backend/.env:\n');
    console.log(`EMAIL_USER=${testAccount.user}`);
    console.log(`EMAIL_PASSWORD=${testAccount.pass}`);
    console.log(`EMAIL_FROM=EcoSync <${testAccount.user}>\n`);
    
    console.log('📖 How it works:');
    console.log('   • Emails won\'t actually be sent');
    console.log('   • Check sent emails at: https://ethereal.email/messages');
    console.log('   • Login with the credentials above\n');
    
    console.log('⚠️  Note: This is for TESTING ONLY. Use Gmail for production.\n');
    
  } catch (error) {
    console.error('❌ Failed to create test account:', error.message);
  }
}

setupEthereal();
