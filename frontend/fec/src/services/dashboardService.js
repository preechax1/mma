import { API_BASE_URL } from './apiConfig';


const base = `${API_BASE_URL}/dashboard`;


export const getStatusFec = async () => {
  const res = await fetch(`${base}/status`);
  const result = await res.json();
  return result.data;
};

export const getStatusGroupFec = async () => {
  const res = await fetch(`${base}/status_group`);
  const result = await res.json();
  return result.data;
};
