import { Markup } from 'telegraf';
import { CopperXContext } from '../types';
import { walletService } from '../services/walletService';

export function registerWalletHandlers(bot: any) {
  // Balance command handler
  bot.command('balance', async (ctx: CopperXContext) => {
    await handleBalanceCommand(ctx);
  });

  // Balance button handler
  bot.hears('💰 Balance', async (ctx: CopperXContext) => {
    await handleBalanceCommand(ctx);
  });

  // Deposit command handler
  bot.command('deposit', async (ctx: CopperXContext) => {
    await handleDepositCommand(ctx);
  });

  // Deposit button handler
  bot.hears('📥 Deposit', async (ctx: CopperXContext) => {
    await handleDepositCommand(ctx);
  });

  // Set default wallet handler - Fixed with type assertion
  bot.action(/set_default_wallet:(.+)/, async (ctx: CopperXContext) => {
    await ctx.answerCbQuery();
    
    // Use type assertion to access the match property
    const walletId = (ctx as any).match[1];
    const token = ctx.session.authToken;
    
    if (!token) {
      await ctx.reply('Session expired. Please login again with /login');
      return;
    }
    
    try {
      await walletService.setDefaultWallet(token, walletId);
      await ctx.editMessageText(
        '✅ Default wallet updated successfully!\n\nUse /balance to see your updated wallet details.',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      await ctx.editMessageText('❌ Failed to update default wallet. Please try again later.');
    }
  });
}

// Helper function to handle balance command
async function handleBalanceCommand(ctx: CopperXContext) {
  const token = ctx.session.authToken;
  
  if (!token) {
    await ctx.reply('You need to log in first. Use /login');
    return;
  }
  
  try {
    // Get wallets and balances
    const [wallets, balances] = await Promise.all([
      walletService.getWallets(token),
      walletService.getBalances(token)
    ]);
    
    // Find default wallet
    const defaultWallet = wallets.find(wallet => wallet.isDefault);
    
    let message = '💰 *Your CopperX Balances*\n\n';
    
    if (balances.length === 0) {
      message += '_No balances found. Deposit funds to get started._\n\n';
    } else {
      balances.forEach(balance => {
        message += `*${balance.network}*: ${walletService.formatBalance(balance.balance)} USDC\n`;
      });
      message += '\n';
    }
    
    // Display default wallet
    if (defaultWallet) {
      message += '✅ *Default Wallet*\n';
      message += `Network: ${defaultWallet.network}\n`;
      message += `Address: \`${walletService.formatAddress(defaultWallet.address, false)}\`\n\n`;
    } else {
      message += '⚠️ *No default wallet set*\n\n';
    }
    
    message += 'Use /deposit to get instructions for depositing funds.';
    
    // Create buttons for setting default wallet
    const buttons = wallets.map(wallet => {
      const label = wallet.isDefault 
        ? `✅ ${wallet.network} (Current)` 
        : `Set ${wallet.network} as Default`;
      
      return Markup.button.callback(
        label,
        `set_default_wallet:${wallet.id}`
      );
    });
    
    const keyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      keyboard.push(buttons.slice(i, i + 2));
    }
    
    await ctx.replyWithMarkdown(
      message,
      Markup.inlineKeyboard(keyboard)
    );
  } catch (error) {
    await ctx.reply('❌ Failed to load balance information. Please try again later.');
  }
}

// Helper function to handle deposit command
async function handleDepositCommand(ctx: CopperXContext) {
  const token = ctx.session.authToken;
  
  if (!token) {
    await ctx.reply('You need to log in first. Use /login');
    return;
  }
  
  try {
    const wallets = await walletService.getWallets(token);
    
    if (wallets.length === 0) {
      await ctx.reply('❌ No wallets available. Please contact CopperX support.');
      return;
    }
    
    let message = '📥 *Deposit USDC to your CopperX Account*\n\n';
    message += 'You can send USDC to any of these addresses:\n\n';
    
    wallets.forEach(wallet => {
      message += `*${wallet.network}*${wallet.isDefault ? ' (Default)' : ''}\n`;
      message += `\`${wallet.walletAddress}\`\n\n`;
    });
    
    message += '⚠️ *Important*: Only send USDC to these addresses. Sending other tokens may result in loss of funds.\n\n';
    message += 'You will receive a notification when your deposit is confirmed.';
    
    await ctx.replyWithMarkdown(message);
  } catch (error) {
    await ctx.reply('❌ Failed to load deposit information. Please try again later.');
  }
}