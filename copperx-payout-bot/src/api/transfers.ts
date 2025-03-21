import axios from 'axios';
import { config } from '../config';
import { Transfer, APIError,Currency,PurposeCode } from '../types';
 
const baseURL = `${config.apiBaseUrl}/api`;

export const transferApi = {
  sendByEmail: async (token: string, email: string, amount: BigInt,currency?:Currency): Promise<any> => {
    try {
      const response = await axios.post(
        `${baseURL}/transfers/send`,
        {
          email: email,
          amount: amount.toString(),
          purposeCode: PurposeCode.SELF,
          currency: currency || Currency.USDC
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending to email:', error);
      throw error;
    }
  },
  
  sendToWallet: async (token: string, address: string, amount: BigInt, currency?: Currency,purpose?:PurposeCode): Promise<any> => {
    try {
      const response = await axios.post(
        `${baseURL}/transfers/wallet-withdraw`,
        {
          walletAddress: address,
          amount: amount.toString(), //NOTE Use bigint
          purposeCode:purpose || PurposeCode.SELF,
          currency: currency || Currency.USDC
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending to wallet:', error);
      throw error;
    }
  },
  
  withdrawToBank: async (token: string, amount: number, bankDetails: any): Promise<any> => {
    try {
      const response = await axios.post(
        `${baseURL}/transfers/offramp`,
        {
          amount: amount,
          ...bankDetails
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error withdrawing to bank:', error);
      throw error;
    }
  },
  
  sendBatch: async (token: string, transfers: any[]): Promise<any> => {
    try {
      const response = await axios.post(
        `${baseURL}/transfers/send-batch`,
        { transfers },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending batch transfer:', error);
      throw error;
    }
  },
  
  getTransfers: async (token: string, page: number = 1, limit: number = 10): Promise<any> => {
    try {
      const response = await axios.get(`${baseURL}/transfers?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transfers:', error);
      throw error;
    }
  }
};