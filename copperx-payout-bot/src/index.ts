import { Telegraf, session } from 'telegraf';
import { config } from './config';
import { CopperXContext, SessionData } from './types';
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/authMiddleware';

// Import handlers
import { registerAuthHandlers } from './handlers/authHandlers';
import { registerWalletHandlers } from './handlers/walletHandlers';
import { registerTransferHandlers } from './handlers/transferHandlers';
import { registerCommandHandlers } from './handlers/commandHandlers';

// Initialize bot
const bot = new Telegraf<CopperXContext>(config.botToken);

// Setup session middleware
bot.use(
  session({
    defaultSession: (): SessionData => ({})
  })
);

// Apply error handler middleware
bot.use(errorHandler);

// Apply authentication middleware
bot.use(authMiddleware);

// Register handlers
registerCommandHandlers(bot);
registerAuthHandlers(bot);
registerWalletHandlers(bot);
registerTransferHandlers(bot);

// Start the bot
bot.launch()
  .then(() => {
    console.log('CopperX Payout Bot started successfully!');
  })
  .catch((err) => {
    console.error('Failed to start bot:', err);
  });

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('Stopping Bot');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  console.log('Stopping Bot');
  bot.stop('SIGTERM');
});