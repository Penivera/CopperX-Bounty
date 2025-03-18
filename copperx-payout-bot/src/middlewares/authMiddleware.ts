import { CopperXContext } from '../types';

// List of commands that don't require authentication
const publicCommands = ['/start', '/login', '/help', '/about'];

export const authMiddleware = async (
  ctx: CopperXContext,
  next: () => Promise<void>
): Promise<void> => {
  // Check if this is a command
  if (ctx.message && 'text' in ctx.message && ctx.message.text.startsWith('/')) {
    const command = ctx.message.text.split(' ')[0].toLowerCase();
    if (publicCommands.includes(command)) {
      return next();
    }
    
    // If not a public command and not authenticated, prompt for login
    if (!ctx.session.authToken) {
      await ctx.reply(
        '🔒 You need to log in first.\n\nUse /login to connect your CopperX account.'
      );
      return;
    }
  } 
  // For callback queries, allow without auth check if they're related to login
  else if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
    if (ctx.callbackQuery.data === 'login' || 
        ctx.callbackQuery.data.startsWith('login_') ||
        ctx.callbackQuery.data === 'cancel') {
      return next();
    }
    
    // For other callback queries, check auth
    if (!ctx.session.authToken) {
      await ctx.answerCbQuery('You need to log in first. Use /login');
      return;
    }
  }
  
  return next();
};