import axios from 'axios';
import { config } from '../config';
import { AuthResponse, APIError } from '../types';

const baseURL = `${config.apiBaseUrl}/api`;

export const authApi = {
  requestEmailOTP: async (email: string): Promise<{sid: string}> => {
    try {
      const response = await axios.post(`${baseURL}/auth/email-otp/request`, { email });
      console.log('OTP request response:', response.data);
      return response.data;  // Should contain {email, sid}
    } catch (error) {
      console.error('Error requesting OTP:', error);
      throw error;
    }
  },
  
  verifyEmailOTP: async (email: string, otp: string, sid: string): Promise<AuthResponse> => {
    try {
      console.log(`Attempting to verify OTP for ${email} with code ${otp} and sid ${sid}`);
      const response = await axios.post(`${baseURL}/auth/email-otp/authenticate`, {
        email,
        otp,
        sid
      });
      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      console.error('Error verifying OTP:', error);
      if (error.response) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
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