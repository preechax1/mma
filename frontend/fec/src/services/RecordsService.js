import { API_BASE_URL } from "../apiConfig";
const base = `${API_BASE_URL}/records`;


export const getRecords = async () => {
  const res = await fetch(`${base}/boards`);
  const result = await res.json();
  return result.data;
};

export const getRecord = async (id) => {
    const res = await fetch(`${base}/board/${id}`);
    const result = await res.json();
    return result.data;
};
