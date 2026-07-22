import axiosInstance from './axiosInstance';

export const feedbackAPI = {
  submitFeedback: async ({ orderId, rating }) => {
    try {
      const response = await axiosInstance.post('/feedback', { orderId, rating });
      return response.data;
    } catch (error) {
      console.error('Failed to submit feedback:', error.response?.data || error.message);
      throw error;
    }
  },

  getSummary: async () => {
    try {
      const response = await axiosInstance.get('/feedback/summary');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch feedback summary:', error.response?.data || error.message);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await axiosInstance.get('/feedback');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch feedback list:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default feedbackAPI;