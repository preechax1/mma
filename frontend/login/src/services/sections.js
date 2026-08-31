
import { API_BASE_URL } from './apiConfig';
const base = `${API_BASE_URL}/sections`;

export const getSections = async () => {
  const res = await fetch(`${API_BASE_URL}/sections`);
  const result = await res.json();
  return result.data.data;
};

 