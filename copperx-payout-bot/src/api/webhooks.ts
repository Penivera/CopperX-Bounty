import express from 'express';
import bodyParser from 'body-parser';
import { config } from '../config';
import { WebhookEventHandler } from '../types';

export class WebhookService {
  private app: express.Express;
  private eventHandlers: Map<string, WebhookEventHandler[]> = new Map();
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.configureMiddleware();
    this.setupRoutes();
  }

  private configureMiddleware() {
    this.app.use(bodyParser.json());
  }

  private setupRoutes() {
    this.app.post('/webhook', (req, res) => {
      try {
        const event = req.body;
        console.log('Received webhook event:', event);
        
        if (event && event.type) {
          this.processEvent(event);
          res.status(200).send({ status: 'success' });
        } else {
          console.error('Invalid webhook event format:', event);
          res.status(400).send({ status: 'error', message: 'Invalid event format' });
        }
      } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send({ status: 'error', message: 'Internal server error' });
      }
    });
  }

  public registerEventHandler(eventType: string, handler: WebhookEventHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
    console.log(`Registered handler for event type: ${eventType}`);
  }

  private processEvent(event: any) {
    const { type } = event;
    
    if (this.eventHandlers.has(type)) {
      const handlers = this.eventHandlers.get(type)!;
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    } else {
      console.log(`No handlers registered for event type: ${type}`);
    }
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`Webhook server running on port ${this.port}`);
    });
  }
}

export const webhookService = new WebhookService(config.webhookPort);
