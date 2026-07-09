/**
 * ============================================================
 *  Payment API Service
 * ============================================================
 *  Handles PayHere card payment initiation.
 * ============================================================
 */

import axiosInstance from './axiosInstance';

export const paymentAPI = {
  /**
   * Ask the backend to build a signed PayHere payment payload for the
   * table's current bill. The hash is computed server-side using the
   * merchant secret — never generate it in the browser.
   */
  initiatePayHerePayment: async ({ tableId, tableNumber, sessionId, amount }) => {
    try {
      const response = await axiosInstance.post('/payments/payhere/init', {
        tableId,
        tableNumber,
        sessionId,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to initiate PayHere payment:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default paymentAPI;
