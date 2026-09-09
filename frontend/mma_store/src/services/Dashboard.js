import { API_BASE_URL } from './apiConfig';
const base = `${API_BASE_URL}/dashboard`;


export const getStatus = async () => {
  const res = await fetch(`${base}/get_status`);
  const result = await res.json();
  return result.data;
};

export const getCategory = async () => {
  const res = await fetch(`${base}/get_category`);
  const result = await res.json();
  return result.data;
};


export const getTransaction = async () => {
  const res = await fetch(`${base}/get_transaction`);
  const result = await res.json();
  return result.data;
};







