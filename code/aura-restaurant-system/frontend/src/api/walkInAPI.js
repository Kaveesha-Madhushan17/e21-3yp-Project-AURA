import axiosInstance from './axiosInstance'; // ← plain axios වෙනුවට

const walkInAPI = {
  createSession: async (tableId) => {
    const response = await axiosInstance.post(
      `/walk-in-sessions?tableId=${tableId}` // baseURL already set in axiosInstance
    );
    return response.data;
  },
};

export default walkInAPI;