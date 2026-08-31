import { API_BASE_URL } from "./apiConfig";
import api from "./api";

const base = `${API_BASE_URL}/updateform`;


export const getDetailFEC = async (id) => {
  try {
    const res = await fetch(`${base}/detailfec/${id}`);
    const result = await res.json();
    return result.data; // result.data contains { detail, product, ... }
  } catch (error) {
    console.error("getDetailFEC error:", error);
    return null;
  }
};

export const getOptions = async () => {
  try {
    const res = await fetch(`${base}/options`);
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("getOptions error:", error);
    return null;
  }
};

export const submitFormData = async ({
  form,
  id,
  isUpdate,
  memberID
}) => {
  try {
    const payload = {
      ...form,
      id: id ?? "",
      memberID: memberID ?? "",
    };

    const res = await fetch(`${base}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error(
      "Submit form error:",
      error.message
    );
    throw error;
  }
};
