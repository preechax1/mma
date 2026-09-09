import { API_BASE_URL } from "./apiConfig"; 
const base = `${API_BASE_URL}/stores`;
 
/* =========================
   GET CATEGORIES
========================= */
export const getCategories = async (id) => {
  const res = await fetch(`${API_BASE_URL}/stores/categories`);
  const result = await res.json();
  return result.data;
};

/* =========================
   GET MODELS
========================= */

export const getModels = async (id) => {
  const res = await fetch(`${API_BASE_URL}/stores/models`);
  const result = await res.json();
  return result.data;
};
