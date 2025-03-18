import { transferApi } from '../api/transfers';
import { Transfer } from '../types';

export class TransferService {
  async sendByEmail(token: string, email: string, amount: number): Promise<any> {
    try {
      return await transferApi.sendByEmail(token, email, amount);
    } catch (error) {
      console.error('Error in TransferService.sendByEmail:', error);
      throw error;
    }
  }
  
  async sendToWallet(token: string, address: string, amount: number, network?: string): Promise<any> {
    try {
      return await transferApi.sendToWallet(token, address, amount, network);
    } catch (error) {
      console.error('Error in TransferService.sendToWallet:', error);
      throw error;
    }
  }
  
  async withdrawToBank(token: string, amount: number, bankDetails: any): Promise<any> {
    try {
      return await transferApi.withdrawToBank(token, amount, bankDetails);
    } catch (error) {
      console.error('Error in TransferService.withdrawToBank:', error);
      throw error;
    }
  }
  
  async getTransfers(token: string, page: number = 1, limit: number = 10): Promise<Transfer[]> {
    try {
      return await transferApi.getTransfers(token, page, limit);
    } catch (error) {
      console.error('Error in TransferService.getTransfers:', error);
      throw error;
    }
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Create and export a singleton instance
export const transferService = new TransferService();