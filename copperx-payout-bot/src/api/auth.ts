import axios from 'axios';
import { config } from '../config';
import { AuthResponse, APIError } from '../types';

const baseURL = `${config.apiBaseUrl}/api`;

export const authApi = {
  requestEmailOTP: async (email: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${baseURL}/auth/email-otp/request`, { email });
      return true;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      throw error;
    }
  },
  
  verifyEmailOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${baseURL}/auth/email-otp/authenticate`, { email, otp });
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },
  
  getUserProfile: async (token: string): Promise<any> => {
    try {
      const response = await axios.get(`${baseURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  getKYCStatus: async (token: string): Promise<any> => {
    try {
      const response = await axios.get(`${baseURL}/kycs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      throw error;
    }
  }
};