import axios from 'axios';
import { config } from '../config';
import { Wallet, Balance, APIError } from '../types';

const baseURL = `${config.apiBaseUrl}/api`;

export const walletApi = {
  getWallets: async (token: string): Promise<Wallet[]> => {
    try {
      const response = await axios.get(`${baseURL}/wallets`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  },
  
  getBalances: async (token: string): Promise<Balance[]> => {
    try {
      const response = await axios.get(`${baseURL}/wallets/balances`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching balances:', error);
      throw error;
    }
  },
  
  setDefaultWallet: async (token: string, walletId: string): Promise<boolean> => {
    try {
      const response = await axios.put(
        `${baseURL}/wallets/default`,
        { walletId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Error setting default wallet:', error);
      throw error;
    }
  },
  
  getDefaultWallet: async (token: string): Promise<Wallet> => {
    try {
      const response = await axios.get(`${baseURL}/wallets/default`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching default wallet:', error);
      throw error;
    }
  }
};