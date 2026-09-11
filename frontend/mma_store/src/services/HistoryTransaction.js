import { API_BASE_URL } from './apiConfig';
const base = `${API_BASE_URL}/historytransaction`;


export const getHistoryList = async () => {
  const res = await fetch(`${base}/history_list`);
  const result = await res.json();
  return result.data;
};


