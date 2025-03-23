import { webhookService } from '../api/webhooks';
import { config } from '../config';
import axios from 'axios';

export class NotificationService {
  private telegramId: number;
  private userId: string;
  private token: string;
  private organizationId: string;
  private sendMessage: (chatId: number, message: string) => Promise<void>;
  
  constructor(
    telegramId: number, 
    userId: string, 
    token: string, 
    organizationId: string,
    sendMessageFn: (chatId: number, message: string) => Promise<void>
  ) {
    this.telegramId = telegramId;
    this.userId = userId;
    this.token = token;
    this.organizationId = organizationId;
    this.sendMessage = sendMessageFn;
  }
  
  async initialize(): Promise<void> {
    try {
      this.registerWebhookHandlers();
      console.log(`Notifications initialized for user: ${this.telegramId}`);
    } catch (error) {
      console.error('Error initializing notification service:', error);
      throw error;
    }
  }
  
  private registerWebhookHandlers(): void {
    // Register handlers for different event types
    webhookService.registerEventHandler('deposit', (event) => {
      if (event.organizationId === this.organizationId) {
        this.sendMessage(
          this.telegramId,
          `💰 *New Deposit Received*\n\n${event.amount} USDC deposited on ${event.network || 'Solana'}`
        );
      }
    });

    webhookService.registerEventHandler('withdrawal', (event) => {
      if (event.organizationId === this.organizationId) {
        this.sendMessage(
          this.telegramId,
          `🏦 *Withdrawal Processed*\n\n${event.amount} USDC has been withdrawn`
        );
      }
    });

    webhookService.registerEventHandler('transfer', (event) => {
      if (event.organizationId === this.organizationId) {
        this.sendMessage(
          this.telegramId,
          `📤 *Transfer Completed*\n\n${event.amount} USDC has been transferred to ${event.recipient}`
        );
      }
    });
  }
}