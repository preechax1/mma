import { API_BASE_URL } from './apiConfig';

const base = `${API_BASE_URL}/dashboard`;

const parseJson = async (res) => {
  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result?.detail || 'Request failed');
  }

  return result;
};

export const getAllyield = async () => {
  const res = await fetch(`${base}/all`);
  return parseJson(res);
};

export const getGroupYield = async () => {
  const res = await fetch(`${base}/groupyield`);
  return parseJson(res);
};

export const getModelYield = async () => {
  const res = await fetch(`${base}/modelyield`);
  return parseJson(res);
};