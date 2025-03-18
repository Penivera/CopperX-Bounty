import { walletApi } from '../api/wallets';
import { Wallet, Balance } from '../types';

export class WalletService {
  async getWallets(token: string): Promise<Wallet[]> {
    try {
      return await walletApi.getWallets(token);
    } catch (error) {
      console.error('Error in WalletService.getWallets:', error);
      throw error;
    }
  }
  
  async getBalances(token: string): Promise<Balance[]> {
    try {
      return await walletApi.getBalances(token);
    } catch (error) {
      console.error('Error in WalletService.getBalances:', error);
      throw error;
    }
  }
  
  async setDefaultWallet(token: string, walletId: string): Promise<boolean> {
    try {
      return await walletApi.setDefaultWallet(token, walletId);
    } catch (error) {
      console.error('Error in WalletService.setDefaultWallet:', error);
      throw error;
    }
  }
  
  async getDefaultWallet(token: string): Promise<Wallet> {
    try {
      return await walletApi.getDefaultWallet(token);
    } catch (error) {
      console.error('Error in WalletService.getDefaultWallet:', error);
      throw error;
    }
  }
  
  formatBalance(balance: number): string {
    return balance.toFixed(2);
  }
  
  formatAddress(address: string, truncate: boolean = true): string {
    if (!truncate) return address;
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }
}

// Create and export a singleton instance
export const walletService = new WalletService();