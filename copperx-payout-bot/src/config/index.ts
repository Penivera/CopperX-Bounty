import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  apiBaseUrl: process.env.API_BASE_URL || 'https://income-api.copperx.io',
  webhookUrl: process.env.WEBHOOK_URL || 'https://your-webhook-url.com',
  webhookPort: parseInt(process.env.WEBHOOK_PORT || '3000', 10),
  // Keep pusher config for backward compatibility
  pusher: {
    key: process.env.PUSHER_KEY || 'e089376087cac1a62785',
    cluster: process.env.PUSHER_CLUSTER || 'ap1',
  }
};

// Validate required config
if (!config.botToken) {
  throw new Error('BOT_TOKEN is required');
}

export const WELCOME_MESSAGE = `
🏦 *Welcome to CopperX Payout Bot* 🏦

This bot allows you to manage your CopperX account directly from Telegram:

• 💰 Check your balance
• 📤 Send USDC to email or wallet addresses
• 📥 Deposit funds to your wallet
• 🏦 Withdraw to bank accounts
• 📋 View transaction history

To get started, use /login to connect your CopperX account.
Need help? Use /help or contact support at @copperxcommunity
`;

export const HELP_MESSAGE = `
🔍 *CopperX Bot Commands*

*Account Management:*
/login - Connect to CopperX account
/logout - Disconnect your account
/profile - View your profile

*Wallet Operations:*
/balance - Check your wallet balance
/deposit - Get deposit instructions
/withdraw - Withdraw funds to bank account

*Transfers:*
/send - Send USDC to email or wallet
/transactions - View recent transactions

*Other:*
/help - Show this help message
/about - About CopperX

Need assistance? Contact @copperxcommunity
`;