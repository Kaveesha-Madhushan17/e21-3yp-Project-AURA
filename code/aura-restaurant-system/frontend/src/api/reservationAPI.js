/**
 * ============================================================
 *  Reservation API Service
 * ============================================================
 *  Handles all customer table reservation API calls.
 * ============================================================
 */

import axiosInstance from './axiosInstance';

export const reservationAPI = {
  /**
   * Get all time slots with their availability for a specific date
   * @param {string} date - Date in 'YYYY-MM-DD' format
   * @returns {Promise<Object>} SlotAvailabilityResponse from backend
   */
  getAvailableSlots: async (date, partySize, tableNumber) => {
    try {
      const params = { date };
      if (partySize != null) params.partySize = partySize;
      if (tableNumber) params.tableNumber = tableNumber;

      const url = tableNumber ? '/reservations/availability' : '/reservations/available';
      const response = await axiosInstance.get(url, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available slots:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Check availability of a single specific slot
   * @param {string} date - Date in 'YYYY-MM-DD' format
   * @param {string} timeSlot - Time in 'HH:mm' format
   * @returns {Promise<Object>} AvailabilityCheckResponse from backend
   */
  checkSlotAvailability: async (date, timeSlot) => {
    try {
      const response = await axiosInstance.get('/reservations/check', {
        params: { date, timeSlot },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check slot availability:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Submit a new reservation
   * @param {Object} data - ReservationRequest fields
   * @returns {Promise<Object>} ReservationResponse from backend
   */
  createReservation: async (data) => {
    try {
      const response = await axiosInstance.post('/reservations', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create reservation:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default reservationAPI;
