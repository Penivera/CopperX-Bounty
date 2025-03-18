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
bot.use(authMiddleware);// filepath: /home/kingtom/Documents/blockchain/CopperX-Bounty/copperx-payout-bot/src/index.ts
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