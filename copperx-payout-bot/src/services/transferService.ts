import { transferApi } from '../api/transfers';
import { Transfer, Currency, PurposeCode } from '../types';

export class TransferService {
  async sendByEmail(token: string, email: string, amount: number, currency?: Currency): Promise<any> {
    try {
      // Convert amount to smallest unit (8 decimals)
      const amountInSmallestUnit = BigInt(Math.round(amount * 100000000));
      return await transferApi.sendByEmail(token, email, amountInSmallestUnit, currency);
    } catch (error) {
      console.error('Error in TransferService.sendByEmail:', error);
      throw error;
    }
  }
  
  async sendToWallet(token: string, address: string, amount: number, currency?: Currency, purpose?: PurposeCode): Promise<any> {
    try {
      // Convert amount to smallest unit (8 decimals)
      const amountInSmallestUnit = BigInt(Math.round(amount * 100000000));
      return await transferApi.sendToWallet(token, address, amountInSmallestUnit, currency, purpose || PurposeCode.SALARY);
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

  formatAmount(amount: number): string {
    return `$${amount.toFixed(2)} (${(amount * 100000000).toFixed(0)} units)`;
  }
}

// Create and export a singleton instance
export const transferService = new TransferService();