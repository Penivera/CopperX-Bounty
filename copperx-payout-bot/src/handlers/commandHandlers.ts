import { Markup } from 'telegraf';
import { CopperXContext } from '../types';
import { WELCOME_MESSAGE, HELP_MESSAGE } from '../config';
import { authService } from '../services/authService';

export function registerCommandHandlers(bot: any) {
  // Start command
  bot.command('start', async (ctx: CopperXContext) => {
    await ctx.replyWithMarkdown(
      WELCOME_MESSAGE,
      Markup.inlineKeyboard([
        Markup.button.callback('Login to CopperX', 'login')
      ])
    );
  });
  
  // Help command
  bot.command('help', async (ctx: CopperXContext) => {
    await ctx.replyWithMarkdown(HELP_MESSAGE);
  });
  
  // About command
  bot.command('about', async (ctx: CopperXContext) => {
    await ctx.replyWithMarkdown(
      `🏦 *About CopperX*\n\n` +
      `CopperX is building a stablecoin bank for individuals and businesses.\n\n` +
      `Our platform enables you to easily manage your USDC across different networks, ` +
      `make payments, and handle banking operations.\n\n` +
      `Visit us at: [CopperX](https://copperx.io)\n` +
      `Support: @copperxcommunity`
    );
  });
  
  // Profile command
  bot.command('profile', async (ctx: CopperXContext) => {
    const token = ctx.session.authToken;
    
    if (!token) {
      await ctx.reply('You need to log in first. Use /login');
      return;
    }
    
    try {
      const userProfile = await authService.getUserProfile(token);
      const kycStatus = await authService.getKYCStatus(token);
      
      await ctx.replyWithMarkdown(
        `👤 *CopperX Profile*\n\n` +
        `Name: ${userProfile.firstName || ''} ${userProfile.lastName || ''}\n` +
        `Email: ${userProfile.email}\n` +
        `KYC Status: ${kycStatus.status || 'Not verified'}\n` +
        `KYC Level: ${kycStatus.level || 0}\n\n` +
        `Use /balance to check your wallet balances.`
      );
    } catch (error) {
      await ctx.reply('Failed to fetch your profile. Please try again later.');
    }
  });
  
  // Handle main menu buttons
  bot.hears('⚙️ Settings', async (ctx: CopperXContext) => {
    await ctx.reply(
      '⚙️ Settings',
      Markup.inlineKeyboard([
        [Markup.button.callback('View Profile', 'view_profile')],
        [Markup.button.callback('Log Out', 'logout')]
      ])
    );
  });
  
  // View profile callback
  bot.action('view_profile', async (ctx: CopperXContext) => {
    await ctx.answerCbQuery();
    
    try {
      const token = ctx.session.authToken;
      if (!token) throw new Error('Not authenticated');
      
      const userProfile = await authService.getUserProfile(token);
      const kycStatus = await authService.getKYCStatus(token);
      
      await ctx.editMessageText(
        `👤 *CopperX Profile*\n\n` +
        `Name: ${userProfile.firstName || ''} ${userProfile.lastName || ''}\n` +
        `Email: ${userProfile.email}\n` +
        `KYC Status: ${kycStatus.status || 'Not verified'}\n` +
        `KYC Level: ${kycStatus.level || 0}`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      await ctx.editMessageText('Failed to fetch your profile. Please try again later.');
    }
  });
}