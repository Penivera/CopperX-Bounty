import { authApi } from '../api/auth';
import { AuthResponse, User, KYCStatus } from '../types';

export class AuthService {
  async requestOTP(email: string): Promise<{sid: string}> {
    try {
      return await authApi.requestEmailOTP(email);
    } catch (error) {
      console.error('Error in AuthService.requestOTP:', error);
      throw error;
    }
  }
  
  async verifyOTP(email: string, otp: string, sid: string): Promise<AuthResponse> {
    try {
      return await authApi.verifyEmailOTP(email, otp, sid);
    } catch (error) {
      console.error('Error in AuthService.verifyOTP:', error);
      throw error;
    }
  }
  
  async getUserProfile(token: string): Promise<User> {
    try {
      return await authApi.getUserProfile(token);
    } catch (error) {
      console.error('Error in AuthService.getUserProfile:', error);
      throw error;
    }
  }
  
  async getKYCStatus(token: string): Promise<KYCStatus> {
    try {
      return await authApi.getKYCStatus(token);
    } catch (error) {
      console.error('Error in AuthService.getKYCStatus:', error);
      throw error;
    }
  }
  
  isTokenExpired(token: string): boolean {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();