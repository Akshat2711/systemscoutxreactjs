import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const fetchSystemInfo = async () => {
  const response = await axios.get(`${API_URL}/info`);
  return response.data;
};
