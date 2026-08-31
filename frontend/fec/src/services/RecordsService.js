import { API_BASE_URL } from "./apiConfig";
const base = `${API_BASE_URL}/record`;


export const getRecords = async () => {
  const res = await fetch(`${base}/records`);
  const result = await res.json();
  return result.data;
};

export const getSerial = async (serial) => {
    const res = await fetch(`${base}/recordsn/${serial}`);
    const result = await res.json();
    return result.data;
};

export const getRecordById = async (id) => {
    const res = await fetch(`${base}/recordid/${id}`);
    const result = await res.json();
    return result.data;
};
