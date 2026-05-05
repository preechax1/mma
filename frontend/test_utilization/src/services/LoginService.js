import axios from 'axios';

// const API_URL = 'http://localhost/OP3_MMA/api/test_utilization/LoginService.php';

import { API_BASE_URL } from '../apiConfig';
const base = `${API_BASE_URL}/LoginService`;

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  try {
    const response = await axios.post(`${API_URL}/login`, formData);
    return response.data;
  } catch (error) {
    console.error("Login Error:", error);
    return { status: 0, message: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" };
  }
};