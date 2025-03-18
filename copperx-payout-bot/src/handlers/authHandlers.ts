import { Markup, Scenes, session } from 'telegraf';
import { CopperXContext } from '../types';
import { authService } from '../services/authService';
import { NotificationService } from '../services/notificationService';

// Track users in OTP verification process
const usersInAuthFlow: Record<number, {
  email?: string;
  sid?: string;  // Add sid to track the session ID
  step: 'email' | 'otp';
}> = {};

export function registerAuthHandlers(bot: any) {
  // Login command handler
  bot.command('login', async (ctx: CopperXContext) => {
    await handleLoginCommand(ctx);
  });

  // Login button handler
  bot.action('login', async (ctx: CopperXContext) => {
    await ctx.answerCbQuery();
    await handleLoginCommand(ctx);
  });

  // Email input handler
  bot.hears(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/i, async (ctx: CopperXContext) => {
    const userId = ctx.from?.id;
    if (!userId || !usersInAuthFlow[userId] || usersInAuthFlow[userId].step !== 'email') {
      return;
    }

    // The text is guaranteed to exist due to the hears() matcher
    const email = (ctx.message as any).text;
    
    try {
      // Get session ID from the OTP request
      const response = await authService.requestOTP(email);
      usersInAuthFlow[userId].email = email;
      usersInAuthFlow[userId].sid = response.sid;  // Store the session ID
      usersInAuthFlow[userId].step = 'otp';
      
      await ctx.reply(
        `📤 OTP sent to ${email}\n\nPlease enter the 6-digit code from your email:`
      );
    } catch (error) {
      await ctx.reply('❌ Failed to send OTP. Please check your email address and try again.');
      delete usersInAuthFlow[userId];
    }
  });

  // OTP code handler
  bot.hears(/^\d{6}$/, async (ctx: CopperXContext) => {
    const userId = ctx.from?.id;
    if (!userId || 
        !usersInAuthFlow[userId] || 
        usersInAuthFlow[userId].step !== 'otp' || 
        !usersInAuthFlow[userId].email || 
        !usersInAuthFlow[userId].sid) {  // Check for sid
      return;
    }

    // The text is guaranteed to exist due to the hears() matcher
    const otp = (ctx.message as any).text;
    const email = usersInAuthFlow[userId].email!;
    const sid = usersInAuthFlow[userId].sid!;  // Get the session ID

    try {
      console.log(`Authenticating with email: ${email}, OTP: ${otp}, SID: ${sid}`);
      const authResponse = await authService.verifyOTP(email, otp, sid);  // Pass the sid
      
      // Store auth data in session
      ctx.session.authToken = authResponse.accessToken;
      ctx.session.email = email;
      ctx.session.userId = authResponse.userId;
      ctx.session.organizationId = authResponse.organizationId;

      // Clean up auth flow state
      delete usersInAuthFlow[userId];

      // Set up notifications
      setupNotifications(ctx);

      // Get user profile
      const userProfile = await authService.getUserProfile(authResponse.accessToken);
      
      await ctx.reply(
        `✅ Successfully logged in as ${userProfile.firstName || email}!`,
        Markup.keyboard([
          ['💰 Balance', '📤 Send USDC'],
          ['📥 Deposit', '🏦 Withdraw'],
          ['📋 Transactions', '⚙️ Settings']
        ]).resize()
      );
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        await ctx.reply(`❌ OTP verification failed: ${error.response.data.message}`);
      } else {
        await ctx.reply('❌ Invalid OTP or it has expired. Please use /login to request a new code.');
      }
      // Clean up after failure to allow retry
      delete usersInAuthFlow[userId];
    }
  });

  // Logout command
  bot.command('logout', async (ctx: CopperXContext) => {
    await handleLogout(ctx);
  });

  // Logout button
  bot.action('logout', async (ctx: CopperXContext) => {
    await ctx.answerCbQuery();
    await handleLogout(ctx);
  });

  // Cancel authentication
  bot.hears(/cancel|exit|quit/i, async (ctx: CopperXContext) => {
    const userId = ctx.from?.id;
    if (userId && usersInAuthFlow[userId]) {
      delete usersInAuthFlow[userId];
      await ctx.reply('Authentication cancelled. Use /login to try again.');
    }
  });
}

// Helper function for login command
async function handleLoginCommand(ctx: CopperXContext) {
  // Already logged in
  if (ctx.session.authToken) {
    await ctx.reply(
      'You are already logged in. Use /logout to sign out first.'
    );
    return;
  }

  // Start auth flow
  const userId = ctx.from?.id;
  if (userId) {
    usersInAuthFlow[userId] = { step: 'email' };
    
    await ctx.reply(
      '🔐 *CopperX Login*\n\nPlease enter your email address to receive a one-time login code.\n\n' +
      'Or type "cancel" to abort.', 
      { parse_mode: 'Markdown' }
    );
  }
}

// Helper function for logout
async function handleLogout(ctx: CopperXContext) {
  if (!ctx.session.authToken) {
    await ctx.reply('You are not logged in.');
    return;
  }

  // Clear session
  ctx.session.authToken = undefined;
  ctx.session.email = undefined;
  ctx.session.userId = undefined;
  ctx.session.organizationId = undefined;

  await ctx.reply('You have been logged out.');
}

// Setup notifications helper function in authHandlers.ts
async function setupNotifications(ctx: CopperXContext) {
  if (!ctx.from?.id || !ctx.session.authToken || !ctx.session.userId || !ctx.session.organizationId) {
    return;
  }

  try {
    const notificationService = new NotificationService(
      ctx.from.id,
      ctx.session.userId,
      ctx.session.authToken,
      ctx.session.organizationId,
      async (chatId: number, message: string) => {
        // Use ctx.telegram instead of bot.telegram
        await ctx.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      }
    );
    
    await notificationService.initialize();
    console.log('Notifications initialized for user:', ctx.from.id);
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
}