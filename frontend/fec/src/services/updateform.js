import api from "./api";

/* ================= BASE PATH ================= */

const BASE_PATH = "/fec/api_update_form.php";

/* ================= LOAD SELECT OPTIONS ================= */

export const loadSelectOptions = async (key, id = "") => {
  try {
    const { data } = await api.get(BASE_PATH, {
      params: {
        ID: id,
        function: key
      }
    });

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Load ${key} error:`, error);
    return [];
  }
};

/* ================= LOAD FORM DATA (EDIT MODE) ================= */

export const loadFormData = async (id) => {
  try {
    const { data } = await api.get(BASE_PATH, {
      params: {
        ID: id,
        function: "load_from"
      }
    });

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return {};
  } catch (error) {
    console.error("Load form data error:", error);
    return {};
  }
};

/* ================= SUBMIT FORM ================= */

export const submitFormData = async ({
  form,
  id,
  isUpdate
}) => {
  try {
    const payload = {
      ...form,
      id: id ?? "",                 // ✅ ตัวเล็ก
      function: isUpdate ? "update" : "update" 
    };
    delete payload.fctID;
    

    const { data } = await api.post(BASE_PATH, payload);

    return data;
  } catch (error) {
    console.error(
      "Submit form error:",
      error.response?.data || error.message
    );
    throw error;
  }
};