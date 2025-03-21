import { Markup } from 'telegraf';
import { CopperXContext,Currency } from '../types';
import { transferService } from '../services/transferService';
import { walletService } from '../services/walletService';

// Track users in transfer flow
const usersInTransferFlow: Record<number, {
  step: 'recipient' | 'amount' | 'confirm';
  type: 'email' | 'wallet' | 'bank';
  data: {
    recipientEmail?: string;
    recipientWallet?: string;
    amount?: number;
    currency?: Currency;
  };
}> = {};

export function registerTransferHandlers(bot: any) {
  // Send command handler
  bot.command('send', async (ctx: CopperXContext) => {
    await handleSendCommand(ctx);
  });

  // Send button handler
  bot.hears('📤 Send USDC', async (ctx: CopperXContext) => {
    await handleSendCommand(ctx);
  });

  // Withdraw command handler
  bot.command('withdraw', async (ctx: CopperXContext) => {
    await handleWithdrawCommand(ctx);
  });

  // Withdraw button handler
  bot.hears('🏦 Withdraw', async (ctx: CopperXContext) => {
    await handleWithdrawCommand(ctx);
  });

  // Transactions command handler
  bot.command('transactions', async (ctx: CopperXContext) => {
    await handleTransactionsCommand(ctx);
  });

  // Transactions button handler
  bot.hears('📋 Transactions', async (ctx: CopperXContext) => {
    await handleTransactionsCommand(ctx);
  });

  // Handle sending method selection
  bot.action(/send_(email|wallet)/, async (ctx: CopperXContext) => {
    await ctx.answerCbQuery();
    
    const userId = ctx.from?.id;
    if (!userId) return;
    
    // Use type assertion for match property
    const type = (ctx as any).match[1] as 'email' | 'wallet';
    
    usersInTransferFlow[userId] = {
      step: 'recipient',
      type,
      data: {}
    };
    
    if (type === 'email') {
      await ctx.editMessageText(
        '📧 *Send USDC to Email*\n\nPlease enter the recipient\'s email address:\n\n' +
        'Or type "cancel" to abort.',
        { parse_mode: 'Markdown' }
      );
    } else {
      await ctx.editMessageText(
        '🔑 *Send USDC to Wallet Address*\n\nPlease enter the recipient\'s wallet address:\n\n' +
        'Or type "cancel" to abort.',
        { parse_mode: 'Markdown' }
      );
    }
  });

  // Handle email input for transfers
  bot.hears(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/i, async (ctx: CopperXContext) => {
    const userId = ctx.from?.id;
    if (!userId || !usersInTransferFlow[userId] || 
        usersInTransferFlow[userId].step !== 'recipient' || 
        usersInTransferFlow[userId].type !== 'email') {
      return;
    }
    
    const email = (ctx.message as any).text;
    
    usersInTransferFlow[userId].data.recipientEmail = email;
    usersInTransferFlow[userId].step = 'amount';
    
    await ctx.reply(
      `📧 Sending to: ${email}\n\nEnter the amount of USDC to send:\n\n` +
      'Or type "cancel" to abort.'
    );
  });

  //NOTE Handle wallet address input for transfers
  bot.hears(/^[a-zA-Z0-9]{32,}$/, async (ctx: CopperXContext) => {
    const userId = ctx.from?.id;
    if (!userId || !usersInTransferFlow[userId] || 
        usersInTransferFlow[userId].step !== 'recipient' || 
        usersInTransferFlow[userId].type !== 'wallet') {
      return;
    }
    
    const walletAddress = (ctx.message as any).text;
    usersInTransferFlow[userId].data.recipientWallet = walletAddress;
    usersInTransferFlow[userId].step = 'amount';
    
    await ctx.reply(
      `🔑 Sending to address: ${walletService.formatAddress(walletAddress)}\n\nEnter the amount of USDC to send:\n\n` +
      'Or type "cancel" to abort.'
    );
  });

  // Handle amount input
  bot.hears(/^\d+(\.\d+)?$/, async (ctx: CopperXContext) => {
    const userId = ctx.from?.id;
    if (!userId || !usersInTransferFlow[userId] || usersInTransferFlow[userId].step !== 'amount') {
      return;
    }
    
    const amount = parseFloat((ctx.message as any).text);
    
    // Basic validation
    if (amount <= 0) {
      await ctx.reply('⚠️ Amount must be greater than 0. Please try again:');
      return;
    }
    
    usersInTransferFlow[userId].data.amount = amount;
    usersInTransferFlow[userId].step = 'confirm';
    
    // Create confirmation message
    let confirmMessage = '🔍 *Please confirm this transaction:*\n\n';
    confirmMessage += `Amount: ${amount} USDC\n`;
    
    if (usersInTransferFlow[userId].type === 'email') {
      confirmMessage += `To: ${usersInTransferFlow[userId].data.recipientEmail}\n`;
    } else {
      confirmMessage += `To Address: ${walletService.formatAddress(usersInTransferFlow[userId].data.recipientWallet!)}\n`;
    }
    
    // Display confirmation buttons
    await ctx.replyWithMarkdown(
      confirmMessage,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Confirm', 'confirm_transfer'),
          Markup.button.callback('❌ Cancel', 'cancel_transfer')
        ]
      ])
    );
  });

  // Handle transfer confirmation
  bot.action('confirm_transfer', async (ctx: CopperXContext) => {
    await ctx.answerCbQuery();
    
    const userId = ctx.from?.id;
    if (!userId || !usersInTransferFlow[userId] || usersInTransferFlow[userId].step !== 'confirm') {
      await ctx.editMessageText('❌ Session expired. Please start again with /send');
      return;
    }
    
    const { type, data } = usersInTransferFlow[userId];
    const token = ctx.session.authToken;
    
    if (!token) {
      await ctx.editMessageText('❌ Session expired. Please login again with /login');
      delete usersInTransferFlow[userId];
      return;
    }
    
    try {
      if (type === 'email' && data.recipientEmail && data.amount) {
        await transferService.sendByEmail(token, data.recipientEmail, data.amount);
        
        await ctx.editMessageText(
          `✅ Successfully sent ${data.amount} USDC to ${data.recipientEmail}!`
        );
      } else if (type === 'wallet' && data.recipientWallet && data.amount) {
        await transferService.sendToWallet(token, data.recipientWallet, data.amount, data.currency);
        
        await ctx.editMessageText(
          `✅ Successfully sent ${data.amount} USDC to ${walletService.formatAddress(data.recipientWallet)}!`
        );
      } else {
        await ctx.editMessageText('❌ Invalid transfer data. Please try again.');
      }
    } catch (error) {
      await ctx.editMessageText('❌ Transfer failed. Please check your balance and try again later.');
    } finally {
      // Clean up flow state
      delete usersInTransferFlow[userId];
    }
  });

  // Handle transfer cancellation
  bot.action('cancel_transfer', async (ctx: CopperXContext) => {
    await ctx.answerCbQuery();
    
    const userId = ctx.from?.id;
    if (userId) {
      delete usersInTransferFlow[userId];
    }
    
    await ctx.editMessageText('❌ Transfer cancelled.');
  });

  // Handle cancel text input
  bot.hears(/cancel|exit|quit/i, async (ctx: CopperXContext) => {
    const userId = ctx.from?.id;
    if (userId && usersInTransferFlow[userId]) {
      delete usersInTransferFlow[userId];
      await ctx.reply('Transfer cancelled. Use /send to start over.');
    }
  });
}

// Helper function for send command
async function handleSendCommand(ctx: CopperXContext) {
  const token = ctx.session.authToken;
  
  if (!token) {
    await ctx.reply('You need to log in first. Use /login');
    return;
  }
  
  await ctx.replyWithMarkdown(
    '📤 *Send USDC*\n\nPlease select a transfer method:',
    Markup.inlineKeyboard([
      [
        Markup.button.callback('📧 Send to Email', 'send_email'),
        Markup.button.callback('🔑 Send to Wallet', 'send_wallet')
      ]
    ])
  );
}

// Helper function for withdraw command
async function handleWithdrawCommand(ctx: CopperXContext) {
  const token = ctx.session.authToken;
  
  if (!token) {
    await ctx.reply('You need to log in first. Use /login');
    return;
  }
  
  await ctx.replyWithMarkdown(
    '🏦 *Withdraw to Bank Account*\n\n' +
    'Bank withdrawals are currently available only through the web app.\n\n' +
    'Please visit [app.copperx.io](https://app.copperx.io) to withdraw funds to your bank account.\n\n' +
    'You can still use the bot for checking balances, deposits, and sending funds to email or wallet addresses.'
  );
}

// Helper function for transactions command
async function handleTransactionsCommand(ctx: CopperXContext) {
  const token = ctx.session.authToken;
  
  if (!token) {
    await ctx.reply('You need to log in first. Use /login');
    return;
  }
  
  try {
    const transfers = await transferService.getTransfers(token, 1, 10);
    
    if (!transfers || transfers.length === 0) {
      await ctx.replyWithMarkdown('📋 *Transaction History*\n\nNo transactions found.');
      return;
    }
    
    let message = '📋 *Recent Transactions*\n\n';
    
    transfers.forEach((transfer, index) => {
      message += `*${index + 1}. ${transfer.type || 'Transfer'}*\n`;
      message += `Amount: ${transfer.amount} USDC\n`;
      message += `Status: ${transfer.status}\n`;
      
      if (transfer.recipient) {
        message += `Recipient: ${transfer.recipient}\n`;
      } else if (transfer.recipientWallet) {
        message += `Recipient: ${walletService.formatAddress(transfer.recipientWallet)}\n`;
      }
      
      message += `Date: ${transferService.formatDate(transfer.createdAt)}\n\n`;
    });
    
    await ctx.replyWithMarkdown(message);
  } catch (error) {
    await ctx.reply('❌ Failed to load transaction history. Please try again later.');
  }
}