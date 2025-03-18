import axios from 'axios';
import { config } from '../config';

const baseURL = `${config.apiBaseUrl}/api`;

export const notificationApi = {
  authenticate: async (token: string, socketId: string, channelName: string): Promise<any> => {
    try {
      const response = await axios.post(
        `${baseURL}/notifications/auth`,
        {
          socket_id: socketId,
          channel_name: channelName
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error authenticating for notifications:', error);
      throw error;
    }
  }
};