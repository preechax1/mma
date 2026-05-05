import axios from 'axios';

import { API_BASE_URL } from '../apiConfig';
const base = `${API_BASE_URL}/login`;
 
export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  try {
    const response = await axios.post(base, formData);
    return response.data;
  } catch (error) {
    console.error("Login Error:", error);
    return { status: 0, message: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" };
  }
};