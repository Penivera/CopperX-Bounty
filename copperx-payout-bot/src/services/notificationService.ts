import Pusher from 'pusher-js';
import { config } from '../config';
import axios from 'axios';

export class NotificationService {
  private pusherClient: Pusher | null = null;
  private userId: string;
  private token: string;
  private organizationId: string;
  private telegramId: number;
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
      this.pusherClient = new Pusher(config.pusher.key, {
        cluster: config.pusher.cluster,
        authorizer: (channel) => ({
          authorize: async (socketId, callback) => {
            try {
              const response = await axios.post(
                `${config.apiBaseUrl}/api/notifications/auth`,
                {
                  socket_id: socketId,
                  channel_name: channel.name
                },
                {
                  headers: {
                    Authorization: `Bearer ${this.token}`
                  }
                }
              );
              
              if (response.data) {
                callback(null, response.data);
              } else {
                callback(new Error('Pusher authentication failed'), null);
              }
            } catch (error) {
              console.error('Pusher authorization error:', error);
              callback(new Error('Pusher authentication failed'), null);
            }
          }
        })
      });
      
      await this.subscribeToNotifications();
    } catch (error) {
      console.error('Error initializing notification service:', error);
      throw error;
    }
  }
  
  private async subscribeToNotifications(): Promise<void> {
    if (!this.pusherClient) return;
    
    const channelName = `private-org-${this.organizationId}`;
    console.log(`Subscribing to channel: ${channelName}`);
    
    const channel = this.pusherClient.subscribe(channelName);
    
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to private channel');
    });
    
    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Subscription error:', error);
    });
    
    // Bind to deposit events
    channel.bind('deposit', (data: any) => {
      this.sendMessage(
        this.telegramId,
        `💰 *New Deposit Received*\n\n${data.amount} USDC deposited on ${data.network || 'Solana'}`
      );
    });

    // Add handlers for other event types if necessary
    channel.bind('withdrawal', (data: any) => {
      this.sendMessage(
        this.telegramId,
        `🏦 *Withdrawal Processed*\n\n${data.amount} USDC has been withdrawn`
      );
    });
  }
  
  disconnect(): void {
    if (this.pusherClient) {
      this.pusherClient.disconnect();
      this.pusherClient = null;
    }
  }
}