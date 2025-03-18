import axios from 'axios';
import { config } from '../config';
import { Transfer, APIError } from '../types';

const baseURL = `${config.apiBaseUrl}/api`;

export const transferApi = {
  sendByEmail: async (token: string, email: string, amount: number): Promise<any> => {
    try {
      const response = await axios.post(
        `${baseURL}/transfers/send`,
        {
          receiverEmail: email,
          amount: amount
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
  
  sendToWallet: async (token: string, address: string, amount: number, network?: string): Promise<any> => {
    try {
      const response = await axios.post(
        `${baseURL}/transfers/wallet-withdraw`,
        {
          destinationAddress: address,
          amount: amount,
          network: network || 'solana' // Default to Solana if not specified
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