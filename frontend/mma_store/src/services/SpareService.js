import { API_BASE_URL } from "./apiConfig";
const base = `${API_BASE_URL}/spares`;

const requestBody = (payload) => {
  if (payload instanceof FormData) {
    return { body: payload };
  }

  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
};

const parseResponse = async (res) => {
  let result;
  try {
    result = await res.json();
  } catch {
    throw new Error(`Spare API returned invalid JSON (HTTP ${res.status})`);
  }

  if (!res.ok || result?.status === 0) {
    const detail = typeof result?.detail === "string" ? result.detail : "";
    const data = typeof result?.data === "string"
      ? result.data
      : result?.data?.message || result?.data?.error || "";
    throw new Error(data || detail || `Spare API request failed (HTTP ${res.status})`);
  }

  return result;
};


export const getSpareList = async () => {
  const res = await fetch(`${base}/all_list`);
  const result = await res.json();
  return result.data;
};

 

/* =========================
  GET CATEGORIES (for dropdown)
========================= */
export const getCategories = async () => {
  try {
    const res = await fetch(`${base}`);
    const result = await res.json();

    if (!result || !Array.isArray(result.data)) {
      return [];
    }

    const unique = [
      ...new Set(result.data.map((item) => item.category).filter(Boolean)),
    ];

    return unique.map((c, index) => ({
      id: index,
      name: c,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

/* =========================
   CREATE SPARE
========================= */
export const createSpare = async (spare) => {
  try {
    validateSparePayload(spare);
    const res = await fetch(`${base}/create`, {
      method: "POST",
      ...requestBody(spare),
    });

    return await parseResponse(res);
  } catch (error) {
    console.error("Error creating Spare:", error);
    throw error;
  }
};

export const submitFormData = async ({ form, id, isUpdate, memberID }) => {
  try {
    const payload = {
      ...form,
      id: id ?? "",
      memberID: memberID ?? "",
    };

    const res = await fetch(`${base}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Submit form error:", error.message);
    throw error;
  }
};

/* =========================
   UPDATE SPARE
========================= */
export const updateSpare = async (id, spare) => {
  try {
    if (!id) throw new Error("Missing spare ID");
    validateSparePayload(spare);
    const res = await fetch(`${base}/update/${id}`, {
      method: "POST",
      ...requestBody(spare),
    });

    return await parseResponse(res);
  } catch (error) {
    console.error(`Error updating Spare id ${id}:`, error);
    throw error;
  }
};

const validateSparePayload = (payload) => {
  const partNumber = payload instanceof FormData
    ? payload.get("part_number")
    : payload?.part_number;

  if (!String(partNumber || "").trim()) {
    throw new Error("Part Number is required and must be unique");
  }
};

/* =========================
   RECEIVE SPARE
========================= */
export const receiveSpare = async (id, data) => {
  try {
    const res = await fetch(`${base}/receive/${id}`, {
      method: "POST",
      ...requestBody(data),
    });

    return await parseResponse(res);
  } catch (error) {
    console.error(`Error receiving Spare id ${id}:`, error);
    throw error;
  }
};

/* =========================
   DELETE SPARE
========================= */
export const deleteSpare = async (id) => {
  try {
    const res = await fetch(`${base}/delete/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error(`Error deleting Spare id ${id}:`, error);
    throw error;
  }
};

/* =========================
   ALIAS (กัน Hook พัง)
========================= */
export const getAdminTableList = getSpareList;
export const createModel = createSpare;
export const updateModel = updateSpare;
export const deleteModel = deleteSpare;
export const receiveModel = receiveSpare;
