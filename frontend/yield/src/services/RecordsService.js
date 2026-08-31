import { API_BASE_URL } from "./apiConfig";
const base = `${API_BASE_URL}/record`;


export const getGroupName = async () => {
  const res = await fetch(`${base}/select_choice/group_name`);
  const result = await res.json();
  return result.data;
};

export const getPhases = async () => {
  const res = await fetch(`${base}/select_choice/phase`);
  const result = await res.json();
  return result.data;
};

export const getProducts = async () => {
  const res = await fetch(`${base}/select_choice/product`);
  const result = await res.json();
  return result.data;
};

export const getModels = async () => {
  const res = await fetch(`${base}/select_choice/model`);
  const result = await res.json();
  return result.data;
};









export const getRecords = async (serial) => {
    const res = await fetch(`${base}/recordsn/${serial}`);
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
