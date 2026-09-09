import { API_BASE_URL } from './apiConfig';
const base = `${API_BASE_URL}/historytransaction`;


export const getHistoryList = async () => {
  const res = await fetch(`${base}/history_list`);
  const result = await res.json();
  return result.data;
};


/* =========================
   DELETE ATTACHED FILE
========================= */
export const deleteHistoryFile = async ({
  id,
  memberID = "",
  form = {}
}) => {
  try {
    const payload = {
      ...form,
      id: id ?? "",
      memberID: memberID ?? "",
    };

    const res = await fetch(`${API_URL}/historytransaction/delete_file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error(
      `Error deleting file for history id ${id}:`,
      error.message
    );
    throw error;
  }
};


/* =========================
   UPLOAD ATTACHED FILE
========================= */
export const uploadHistoryFile = async (id, formData) => {
  try {
    // Do NOT set the Content-Type header manually — let the browser set the boundary
    const res = await axios.post(`${API_URL}/historytransaction/upload_file/${id}`, formData);
    return res.data;
  } catch (error) {
    console.error(`Error uploading file for history id ${id}:`, error);
    throw error;
  }
};
/* =========================
   GET ALL FILES FOR A TRANSACTION
========================= */
export const getHistoryFiles = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/historytransaction/files/${id}`);
    
    if (res.data && res.data.status === 1) {
      return res.data.data || [];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching files for history id ${id}:`, error);
    return [];
  }
};
