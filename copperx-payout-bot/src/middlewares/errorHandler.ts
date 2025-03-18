import { CopperXContext } from '../types';

export const errorHandler = async (
  ctx: CopperXContext,
  next: () => Promise<void>
): Promise<void> => {
  try {
    await next();
  } catch (error: any) {
    console.error('Error in handler:', error);
    
    // Format error message
    let errorMessage = 'An unexpected error occurred. Please try again later.';
    
    if (error.response?.data?.message) {
      errorMessage = `Error: ${error.response.data.message}`;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    // Respond to user with error
    try {
      await ctx.reply(
        `⚠️ ${errorMessage}\n\nIf this issue persists, please contact support at https://t.me/copperxcommunity/2183`
      );
    } catch (replyError) {
      console.error('Failed to send error message:', replyError);
    }
  }
};