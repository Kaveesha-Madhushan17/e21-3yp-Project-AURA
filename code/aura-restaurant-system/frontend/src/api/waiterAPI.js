// src/api/waiterAPI.js
import axiosInstance from './axiosInstance';

export const waiterAPI = {
  /**
   * Waiter call backend හරහා MQTT publish කරනවා
   * @param {number} tableId
   * @param {string} tableNumber  e.g. "T3"
   * @param {string} message
   */
  callWaiter: async (tableId, tableNumber, message = 'Customer needs assistance') => {
    try {
      const response = await axiosInstance.post('/waiter/call', {
        tableId,
        tableNumber,
        message,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to call waiter:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default waiterAPI;