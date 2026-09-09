import { API_BASE_URL } from "./apiConfig";
import { getModels } from "./StoreService";

/* =========================
   GET ModelById 
========================= */
export const getModelById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/withdrawal/model/${id}`);
  const result = await res.json();
  return result.data;
};


/* =========================
   UPDATE STORE (Withdrawal)
========================= */
export const updateUserSpare = async (id, userSpare) => {
  try {
    const isFormData = userSpare instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/withdrawal/withdrawal/${id}`, {
      method: "POST",
      ...(isFormData ? {} : { headers: { "Content-Type": "application/json" } }),
      body: isFormData ? userSpare : JSON.stringify(userSpare),
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error(`Error updating Store id ${id}:`, error);
    throw error;
  }
};