import api from "./api";

const BASE_FILE = "/fec/file_api.php";

/* ==============================
   GET FILES
============================== */
export const fetchFilesByRecord = async (id) => {
  const { data } = await api.get(BASE_FILE, {
    params: {
      id,
      function: "get_files"
    }
  });

  return data || [];
};

/* ==============================
   UPLOAD FILE
============================== */
export const uploadFile = async (id, file) => {
  const formData = new FormData();

  formData.append("id", id);
  formData.append("function", "upload");

  // ต้องใช้ชื่อ fileupload[]
  formData.append("fileupload[]", file);

  const { data } = await api.post(BASE_FILE, formData);

  return data;
};

/* ==============================
   DELETE FILE
============================== */
export const deleteFile = async (fullPath) => {
  const formData = new FormData();

  formData.append("function", "remove_file");
  formData.append("name", fullPath);

  const { data } = await api.post(BASE_FILE, formData);

  return data;
};